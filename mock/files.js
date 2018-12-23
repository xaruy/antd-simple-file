let localFileList = [];
const getFileOrFolder = (parentId, isFolder) => {
  let list = [];
  if (localFileList.length) {
    list = localFileList.filter(obj => {
      return obj.parentId === parentId && (isFolder ? obj.isDir : true);
    });
  }
  return list;
}
export default {
  // 通过parentId获取文件和文件夹列表
  'POST /api/getFilesOrFolders': (req, res) => {
    const { parentId, isFolder } = req.body;
    const filesList = getFileOrFolder(parentId, isFolder);
    res.send({
      code: 1,
      msg: 'success',
      data: filesList,
    });
  },

  // 新建文件夹
  'POST /api/createFolder': (req, res) => {
    const { all } = req.body;
    const obj = { ...all };
    obj.id = new Date().getTime()
    obj.createdAt = new Date().getTime();
    obj.updatedAt = obj.createdAt;
    localFileList.push(obj);
    res.send({
      code: 1,
      msg: 'success',
      data: obj.id,
    });
  },

  // 根据id删除文件夹或文件
  'POST /api/deleteFileList': (req, res) => {
    const { id } = req.body;
    localFileList = localFileList.filter(file => file.id !== id);
    res.send({
      code: 1,
      msg: 'success',
      data: id,
    });
  },

  // 重命名
  'POST /api/renameFile': (req, res) => {
    const { id, name } = req.body;
    localFileList.forEach(file => {
      if (file.id = id) {
        file.name = name;
        file.updatedAt = new Date().getTime();
      }
    });
    res.send({
      code: 1,
      msg: 'success',
      data: id,
    });
  },

  // 修改文件夹文件parentId(移动文件)
  'POST /api/moveFiles': (req, res) => {
    const { fileList } = req.body;
    if (fileList && fileList.length) {
      fileList.forEach(info => {
        localFileList.forEach(localFile => {
          if (localFile.id === info.id) {
            localFile.parentId = info.parentId;
          }
        });
      });
    }
    res.send({
      code: 1,
      msg: 'success',
    });
  },

  // 添加文件
  'POST /api/addFile': (req, res) => {
    const { all } = req.body;
    const obj = { ...all };
    obj.id = new Date().getTime()
    obj.createdAt = new Date().getTime();
    obj.updatedAt = obj.createdAt;
    localFileList.push(obj);
    res.send({
      code: 1,
      msg: 'success',
      data: obj.id,
    });
  },
};