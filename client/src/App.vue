<template>
  <div id="app">
    <div>
      <input
        type="file"
        :disabled="status !== Status.wait"
        @change="handleFileChange"
      />
      <el-button @click="handleUpload" :disabled="uploadDisabled"
        >上传</el-button
      >
      <el-button @click="handleResume" v-if="status === Status.pause"
        >恢复</el-button
      >
      <el-button
        v-else
        :disabled="status !== Status.uploading || !container.hash"
        @click="handlePause"
        >暂停</el-button
      >
    </div>
    <div>
      <div>计算文件 hash</div>
      <el-progress :percentage="hashPercentage"></el-progress>
      <div>总进度</div>
      <el-progress :percentage="fakeUploadPercentage"></el-progress>
    </div>
  </div>
</template>

<script>
const SIZE = 100 * 1024 * 1024; // 切片大小
const Status = {
  wait: "wait",
  pause: "pause",
  uploading: "uploading"
};

export default {
  name: "app",
  data() {
    return {
      Status,
      container: {
        file: null,
        hash: "",
        worker: null
      },
      hashPercentage: 0,
      data: [],
      requestList: [],
      status: Status.wait,
      fakeUploadPercentage: 0
    };
  },
  computed: {
    uploadDisabled() {
      return (
        !this.container.file ||
        [Status.pause, Status.uploading].includes(this.status)
      );
    },
    uploadPercentage() {
      if (!this.container.file || !this.data.length) return 0;
      const loaded = this.data
        .map(item => item.size * item.percentage)
        .reduce((acc, cur) => acc + cur);
      console.log(parseInt((loaded / this.container.file.size).toFixed(2)));
      return parseInt((loaded / this.container.file.size).toFixed(2));
    }
  },
  watch: {
    uploadPercentage(now) {
      console.log(now);
      if (now >= this.fakeUploadPercentage) {
        this.fakeUploadPercentage = now;
      }
    }
  },
  methods: {
    handlePause() {
      this.status = Status.pause;
      this.resetData();
    },
    resetData() {
      this.requestList.forEach(xhr => xhr?.abort());
      this.requestList = [];
      if (this.container.worker) {
        this.container.worker.onmessage = null;
      }
    },
    async handleResume() {
      this.status = Status.uploading;
      const { uploadedList } = await this.verifyUpload(
        this.container.file.name,
        this.container.hash
      );
      await this.uploadChunks(uploadedList);
    },
    // xhr
    request({
      url,
      method = "post",
      data,
      headers = {},
      onProgress = e => e,
      requestList
    }) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = onProgress;
        xhr.open(method, url);
        Object.keys(headers).forEach(key =>
          xhr.setRequestHeader(key, headers[key])
        );
        xhr.send(data);
        xhr.onload = e => {
          // 将请求成功的 xhr 从列表中删除
          if (requestList) {
            const xhrIndex = requestList.findIndex(item => item === xhr);
            requestList.splice(xhrIndex, 1);
          }
          resolve({
            data: e.target.response
          });
        };
        // 暴露当前 xhr 给外部
        requestList?.push(xhr);
      });
    },
    // 生成文件切片
    createFileChunk(file, size = SIZE) {
      const fileChunkList = [];
      let cur = 0;
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) });
        cur += size;
      }
      return fileChunkList;
    },
    // 生成文件 hash（web-worker）
    calculateHash(fileChunkList) {
      return new Promise(resolve => {
        this.container.worker = new Worker("/hash.js");
        this.container.worker.postMessage({ fileChunkList });
        this.container.worker.onmessage = e => {
          const { percentage, hash } = e.data;
          this.hashPercentage = percentage;
          if (hash) {
            resolve(hash);
          }
        };
      });
    },
    handleFileChange(e) {
      const [file] = e.target.files;
      if (!file) return;
      this.resetData();
      Object.assign(this.$data, this.$options.data());
      this.container.file = file;
    },
    async handleUpload() {
      if (!this.container.file) return;
      this.status = Status.uploading;
      const fileChunkList = this.createFileChunk(this.container.file);
      this.container.hash = await this.calculateHash(fileChunkList);
      // const uploadedList = [];
      const { shouldUpload, uploadedList } = await this.verifyUpload(
        this.container.file.name,
        this.container.hash
      );
      if (!shouldUpload) {
        this.$message.success("秒传：上传成功");
        this.status = Status.wait;
        return;
      }
      console.log(uploadedList);
      this.data = fileChunkList.map(({ file }, index) => {
        return {
          fileHash: this.container.hash,
          index,
          hash: index + "-" + this.container.hash,
          chunk: file,
          size: file.size,
          percentage: uploadedList.includes(index) ? 100 : 0
        };
      });
      console.log(this.data);
      await this.uploadChunks(uploadedList);
    },
    // 上传切片，同时过滤已上传的切片
    async uploadChunks(uploadedList = []) {
      let sendChunkCount = 0;
      let total = this.data.length;
      this.data = this.data.filter(({ hash }) => !uploadedList.includes(hash));
      console.log("this.data", this.data);
      const requestList = this.data
        .filter(({ hash }) => !uploadedList.includes(hash))
        .map(({ chunk, hash, index }) => {
          var formData = new FormData(); //构造FormData对象
          formData.append("token", "token");
          formData.append("f1", chunk);
          formData.append("idx", index);
          formData.append("filename", hash);
          formData.append("fileHash", this.container.hash);
          sendChunkCount += 1;
          return { formData, index };
        })
        .map(async ({ formData, index }) =>
          this.request({
            url: "http://localhost:8100",
            data: formData,
            onProgress: this.createProgressHandler(this.data[index]),
            requestList: this.requestList
          })
        );
      await Promise.all(requestList);
      // 之前上传的切片数量 + 本次上传的切片数量 = 所有切片数量时
      // 合并切片
      if (sendChunkCount === this.data.length) {
        var formD = new FormData();
        formD.append("type", "merge");
        formD.append("token", "token");
        formD.append("chunkCount", total);
        formD.append("fileHash", this.container.hash);
        formD.append("filename", this.container.file.name);
        var xhr2 = new XMLHttpRequest(); //创建对象
        xhr2.open("POST", "http://localhost:8100/", true);
        xhr2.send(formD); //发送时  Content-Type默认就是: multipart/form-data;
      }
    },
    // 根据 hash 验证文件是否曾经已经被上传过
    // 没有才进行上传
    async verifyUpload(filename, fileHash) {
      const { data } = await this.request({
        url: "http://localhost:8100/verify",
        headers: {
          "content-type": "application/json"
        },
        data: JSON.stringify({
          fileHash,
          filename
        })
      });
      return JSON.parse(data);
    },
    // 用保存每个 chunk 的进度数据
    createProgressHandler(item) {
      return e => {
        item.percentage = parseInt(String((e?.loaded / e?.total) * 100));
      };
    }
  }
};
</script>
