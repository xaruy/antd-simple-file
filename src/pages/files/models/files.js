import { message } from 'antd';
import { getFilesOrFolders, createFolder, deleteFileList, renameFile, moveFiles, addFile } from '../../../services/files'

export default {
  namespace: 'files',

  state: {
    list: [],
  },

  effects: {
    // 通过parentId查找文件夹和文件
    *fetchFilesOrFolders({ payload, callback }, { call, put }) {
      const response = yield call(getFilesOrFolders, payload)
      if (!response) {
        message.info('操作失败');
        return;
      }
      if (response.code !== 1) {
        message.info(response.message);
        return;
      }
      yield put({
        type: 'selectFileList',
        payload: response.data,
      });
      if (callback) {
        callback(response.data);
      }
    },

    // 只查找文件夹
    *fetchFolders({ payload, callback }, { call }) {
      const response = yield call(getFilesOrFolders, { ...payload, isFolder: true })
      if (!response) {
        message.info('操作失败');
        return;
      }
      if (response.code !== 1) {
        message.info(response.message);
        return;
      }
      if (callback) {
        callback(response.data);
      }
    },

    // 创建文件夹
    *createFolder({ payload, callback }, { call, put }) {
      const response = yield call(createFolder, payload);
      if (!response) {
        message.info('操作失败');
        return;
      }
      if (response.code !== 1) {
        message.info(response.message);
        return;
      }
      if (payload.all && payload.all.isDir) {
        const newObj = { ...payload.all };
        newObj.id = response.data;
        yield put({
          type: 'addFolder',
          payload: newObj,
        });
        if (callback) {
          callback();
        }
      }
    },

    // 添加文件列表
    *addFiles({ payload }, { call, put }) {
      const work = [];
      if (payload && payload.length) {
        payload.forEach((obj) => {
          work.push(call(addFile, { all: obj }));
        });
      }
      const responses = yield work;
      const succFiles = [];
      if (responses && responses.length) {
        responses.forEach((res, index) => {
          if (res && res.code === 1) {
            const newObj = { ...payload[index] };
            newObj.id = res.data;
            succFiles.push(newObj);
          }
        });
      }
      yield put({
        type: 'addFileList',
        payload: succFiles,
      });
    },

    // 删除文件或文件夹
    *deleteFileList({ payload, callback }, { call, put }) {
      const work = [];
      if (payload && payload.length) {
        payload.forEach((id) => {
          work.push(call(deleteFileList, { id }));
        });
      }
      const responses = yield work;
      const succIds = [];
      responses.forEach((res, index) => {
        if (res && res.code === 1) {
          succIds.push(payload[index]);
        }
      });
      if (payload.length - succIds > 0) {
        message.info(`${payload.length - succIds}个文件删除失败，请重试`);
      }
      if (callback) {
        callback();
      }
      yield put({
        type: 'deleteFiles',
        payload: succIds,
      });
    },

    // 重命名文件夹或文件
    *renameFile({ payload }, { call, put }) {
      const response = yield call(renameFile, payload);
      if (!response) {
        message.info('操作失败');
        return;
      }
      if (response.code !== 1) {
        message.info(response.message);
        return;
      }
      yield put({
        type: 'renameFileList',
        payload,
      });
    },

    // 批量移动文件或文件夹
    *batchMoveFile({ payload, callback }, { call, put }) {
      const response = yield call(moveFiles, payload);
      if (!response) {
        message.info('操作失败');
        return;
      }
      if (response.code !== 1) {
        message.info(response.message);
        return;
      }
      yield put({
        type: 'moveFileList',
        payload: payload.fileList,
      });
      message.success('文件移动成功');
      if (callback) {
        callback();
      }
    },
  },

  reducers: {
    selectFileList(state, action) {
      const folderArr = [];
      const fileArr = [];
      // 文件夹和文件分开，文件夹排前面
      if (action.payload && action.payload.length) {
        action.payload.forEach((info) => {
          if (info.isDir) {
            folderArr.push(info);
          } else {
            fileArr.push(info);
          }
        });
      }
      const newList = folderArr.concat(fileArr);
      return {
        ...state,
        list: newList,
      };
    },
    addFolder(state, action) {
      const folderObj = action.payload;
      const newList = [...state.list];
      newList.unshift(folderObj);
      return {
        ...state,
        list: newList,
      };
    },
    deleteFiles(state, action) {
      const deleteIds = action.payload;
      let newList = [...state.list];
      if (deleteIds && deleteIds.length) {
        newList = state.list.filter((info) => {
          return deleteIds.indexOf(info.id) === -1;
        });
      }
      return {
        ...state,
        list: newList,
      };
    },
    renameFileList(state, action) {
      const file = action.payload;
      const newList = state.list.map((info) => {
        const newObj = { ...info };
        if (info.id === file.id) {
          newObj.name = file.name;
        }
        return newObj;
      });
      return {
        ...state,
        list: newList,
      };
    },
    addFileList(state, action) {
      const arr = action.payload;
      const newList = state.list.concat(arr);
      return {
        ...state,
        list: newList,
      };
    },
    moveFileList(state, action) {
      const moveFiles = action.payload;
      let newList = [...state.list];
      if (moveFiles && moveFiles.length) {
        newList = state.list.filter((info) => {
          return moveFiles.findIndex(file => file.id === info.id) === -1;
        });
      }
      return {
        ...state,
        list: newList,
      };
    },
  },
}
