import React from 'react';
import { connect } from 'dva';
import {
  Upload,
  Icon,
  message,
  Card,
  Button,
  Popconfirm,
  Input,
  Breadcrumb,
  Divider,
  Spin,
  Checkbox,
  Modal
} from 'antd';
import styles from './index.less';
import FoldersModal from '../../components/FoldersModal';

const uploadSrc = '//jsonplaceholder.typicode.com/posts/'; // 图片上传的服务器地址
@connect(({ files, loading }) => ({
  files, loading: loading.models.files,
}))
class Files extends React.Component {
  state = {
    vmode: 'grid', // 文件排列方式，默认网格样式
    overId: null, // 鼠标移入的块
    overCheckId: null, // 鼠标移入勾选框
    indeterminate: false, // 未全选状态
    allChecked: false, // 是否全选
    chooseFiles: [], // 选中的文件id
    imgModalVisble: false, // 图片预览模态框显示
    previevFile: {}, // 点击预览的文件
    newFolderName: '新建文件夹', // 新建文件夹名字
    reName: '', // 重命名名字
    breadcrumbs: [{ name: '全部文件', id: 0 }], // 面包屑内容
    uploadFileList: [], // 上传的文件列表
    parentId: 0, // 该列表的父文件夹
    foldersModalVisible: false, // 文件移动模态框显示
  }

  UNSAFE_componentWillMount() {
    const { dispatch, match: { params: { id, mode } } } = this.props;
    const fid = id || 0;
    const vmode = mode || 'grid';
    this.setState({ vmode });
    dispatch({
      type: 'files/fetchFilesOrFolders',
      payload: {
        parentId: fid,
      },
    });
  }

  showListFile = () => {
    // TODO 列表方式排列文件列表
    return null;
  }

  // 网格方式排列的文件列表
  showGridFile = () => {
    const { files: { list }, loading } = this.props;
    const { overId, chooseFiles, overCheckId, indeterminate, allChecked } = this.state;
    return (
      <div>
        {!!list && !!list.length && (
          <Checkbox
            indeterminate={indeterminate}
            checked={allChecked}
            onChange={this.onCheckAllChange}
          >
            全选{!!chooseFiles && !!chooseFiles.length && (
              <span>(已选中{chooseFiles.length}个文件/文件夹)</span>
            )}
          </Checkbox>
        )}
        <Divider />
        <Spin spinning={loading}>
          <div className={styles.gradFlex}>
            {(!!list && !!list.length) ? list.map((file) => {
              const isChoosed = chooseFiles.indexOf(file.id);
              let classStyle = styles.gradDiv;
              const checkedStyle = {};
              if (file.id === overCheckId) {
                checkedStyle.opacity = 0.5;
              }
              if (file.id === overId) {
                classStyle = `${styles.gradDiv} ${styles.overDiv}`;
                checkedStyle.display = 'block';
              }
              if (isChoosed !== -1) {
                checkedStyle.display = 'block';
                checkedStyle.opacity = 1;
              }
              return (
                <div
                  key={file.id}
                  className={classStyle}
                  onMouseEnter={() => this.handleMouseEnter(file.id)}
                  onMouseLeave={this.handleMouseLeave}
                  onClick={() => this.handleFileClick(file)}
                  style={isChoosed !== -1 ? { border: '1px solid #90c3fd', borderRadius: 5, backgroundColor: '#f1f5fa' } : null}
                >
                  <div className={styles.gradFolder}>
                    {file.isDir ? (
                      <Icon type="folder" theme="filled" style={{ fontSize: '84px', color: '#feda4a' }} />
                    ) :
                      (
                        <img src={file.src} alt={file.name} width={84} />
                      )}
                  </div>
                  <div className={styles.gradFileName}>
                    <a style={{ color: '#424e67', textDecoration: 'none' }}>{file.name}</a>
                  </div>
                  <span
                    className={styles.overCheck}
                    style={checkedStyle}
                    onMouseEnter={() => this.handleCheckEnter(file.id)}
                    onMouseLeave={() => this.handleCheckLeave()}
                  >
                    <Icon
                      type="check-circle"
                      theme="filled"
                      onClick={e => this.handleCheckClick(file, e)}
                    />
                  </span>
                </div>
              );
            }) :
              (
                <div>未上传文件</div>
              )}
          </div>
        </Spin>
      </div >
    );
  }

  handleMouseEnter = (id) => {
    this.setState({ overId: id });
  }

  handleMouseLeave = () => {
    this.setState({ overId: null });
  }

  handleCheckEnter = (id) => {
    this.setState({ overCheckId: id });
  }

  handleCheckLeave = () => {
    this.setState({ overCheckId: null });
  }

  handleFolderModal = () => {
    this.setState({ foldersModalVisible: true });
  }

  // 勾选或取消文件/文件夹
  handleCheckClick = (file, e) => {
    e.stopPropagation();
    const { files: { list } } = this.props;
    const { id } = file;
    const { chooseFiles } = this.state;
    const index = chooseFiles.indexOf(id);
    const newChooseFiles = [...chooseFiles];
    if (index === -1) {
      newChooseFiles.push(id);
    } else {
      newChooseFiles.splice(index, 1);
    }
    this.setState({
      chooseFiles: newChooseFiles,
      indeterminate: !!newChooseFiles.length && (newChooseFiles.length < list.length),
      allChecked: newChooseFiles.length === list.length,
    });
  }

  // 点击预览图片或进入文件夹
  handleFileClick = (file) => {
    if (!file.isDir) {
      this.setState({
        previevFile: file,
        imgModalVisble: true,
      });
    } else {
      const { dispatch } = this.props;
      // const { vmode } = this.state;
      // dispatch(routerRedux.push(`/shop/files/${file.id}/${vmode}`));
      const { breadcrumbs } = this.state;
      dispatch({
        type: 'files/fetchFilesOrFolders',
        payload: {
          parentId: file.id,
        },
        callback: () => {
          const newBread = [...breadcrumbs];
          newBread.push({ name: file.name, id: file.id });
          this.setState({
            breadcrumbs: newBread,
            parentId: file.id,
            chooseFiles: [],
            allChecked: false,
            indeterminate: false,
          });
        },
      });
    }
  }

  // 重命名气泡
  setNameInput = () => {
    const changeValue = (e) => {
      this.setState({ reName: e.target.value });
    };
    return (
      <Input value={this.state.reName} size="small" onChange={changeValue} autoFocus />
    );
  }

  // 全选按钮
  onCheckAllChange = (e) => {
    const { files: { list } } = this.props;
    let chooseFiles = [];
    if (list && list.length) {
      chooseFiles = e.target.checked ? list.map(file => file.id) : [];
    }
    this.setState({
      chooseFiles,
      indeterminate: false,
      allChecked: e.target.checked,
    });
  }

  // 新建文件夹气泡
  newFolderInput = () => {
    const changeValue = (e) => {
      this.setState({ newFolderName: e.target.value });
    };
    return (
      <Input ref={(c) => { this.newInput = c; }} value={this.state.newFolderName} size="small" onChange={changeValue} autoFocus />
    );
  }

  handleNewButton = () => {
    if (this.newInput) {
      this.newInput.select();
    }
  }

  handleImgModalCancel = () => {
    this.setState({
      imgModalVisble: false,
    });
  }

  // 新建文件夹
  handleNewFolder = () => {
    const { newFolderName, parentId } = this.state;
    const { dispatch } = this.props;
    if (!newFolderName) {
      message.error('文件夹名不能为空');
      this.setState({ newFolderName: '新建文件夹' });
      return;
    }
    dispatch({
      type: 'files/createFolder',
      payload: {
        all: {
          name: newFolderName,
          isDir: 1,
          parentId,
          src: 'placeholder',
        },
      },
      callback: () => {
        this.setState({ newFolderName: '新建文件夹' });
      },
    });
  }

  // 删除选中的文件/文件夹
  handleDeleteFile = () => {
    const { chooseFiles } = this.state;
    const { dispatch } = this.props;
    if (chooseFiles && chooseFiles.length) {
      dispatch({
        type: 'files/deleteFileList',
        payload: chooseFiles,
        callback: () => {
          this.setState({ chooseFiles: [], allChecked: false, indeterminate: false });
        },
      });
    }
  }

  // 重命名
  handleSetName = () => {
    const { chooseFiles, reName } = this.state;
    const { dispatch, files: { list } } = this.props;
    const id = chooseFiles[0];
    const file = list.find(info => info.id === id);
    if (!reName) {
      message.info('文件名不能为空');
      return;
    }
    if (file) {
      dispatch({
        type: 'files/renameFile',
        payload: {
          id: file.id,
          name: reName,
        },
      });
    }
  }

  handleMoveCancel = () => {
    this.setState({ foldersModalVisible: false });
  }

  // 移动到模态框操作
  handleMoveOk = (id) => {
    const { chooseFiles } = this.state;
    const { dispatch } = this.props;
    if (chooseFiles && chooseFiles.length) {
      const fileList = chooseFiles.map((fileId) => {
        return {
          id: fileId,
          parentId: id,
        };
      });
      dispatch({
        type: 'files/batchMoveFile',
        payload: {
          fileList,
        },
        callback: () => {
          this.setState({
            chooseFiles: [],
            allChecked: false,
            indeterminate: false,
          });
        },
      });
    }
    this.setState({ foldersModalVisible: false });
  }


  beforeUploadChange = (fileInfo) => {
    const isJPG = fileInfo.type === 'image/jpeg' || fileInfo.type === 'image/png' || fileInfo.type === 'image/gif';
    if (!isJPG) {
      message.error('图片格式不正确，请上传jpg,png,gif图片');
    }
    const isLt2M = fileInfo.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片不能大于2MB!');
    }
    return isJPG && isLt2M;
  }

  // 图片上传及展示
  uploadChange = (info) => {
    let { fileList } = info;
    const { file } = info;
    const { dispatch } = this.props;
    const { parentId } = this.state;
    const successList = [];
    // 过滤掉上传失败的图片和格式错误的文件
    fileList = fileList.filter((fileInfo) => {
      const isJPG = fileInfo.type === 'image/jpeg' || fileInfo.type === 'image/png' || fileInfo.type === 'image/gif';
      const isLt2M = fileInfo.size / 1024 / 1024 < 2;
      if (fileInfo.status === 'error') {
        message.error('有图片上传失败');
      }
      return isJPG && isLt2M && fileInfo.status !== 'error';
    });

    if (file.status === 'done') {
      const newFile = {
        name: file.name,
        isDir: 0,
        parentId,
        src: file.thumbUrl,
      };
      successList.push(newFile);
    }
    if (successList.length) {
      dispatch({
        type: 'files/addFiles',
        payload: successList,
      });
    }
    this.setState({ uploadFileList: fileList });
    // 2.5s后隐藏上传列表
    if (info.file.response || info.file.status === 'error') {
      setTimeout(() => {
        this.setState({ uploadFileList: [] });
      }, 2500);
    }
  }

  // 点击面包屑导航
  clickBreadcrumb = (id, index) => {
    const { breadcrumbs } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'files/fetchFilesOrFolders',
      payload: {
        parentId: id,
      },
      callback: () => {
        const newBread = breadcrumbs.slice(0, index + 1);
        this.setState({
          breadcrumbs: newBread,
          parentId: id,
          chooseFiles: [],
          allChecked: false,
          indeterminate: false,
        });
      },
    });
  }

  render() {
    const { chooseFiles, breadcrumbs, vmode } = this.state;
    return (
      <Card bordered={false}>
        <div>
          <Popconfirm placement="bottomLeft" title={this.newFolderInput()} icon={<Icon type="plus" />} onConfirm={this.handleNewFolder}>
            <Button icon="folder-add" type="primary" style={{ marginRight: 8 }} ghost onClick={this.handleNewButton}>
              新建文件夹
          </Button>
          </Popconfirm>
          {!!chooseFiles && !!chooseFiles.length && (
            <Button.Group style={{ marginRight: 8 }}>
              <Popconfirm placement="bottomLeft" title="确定要删除所选文件/文件夹(文件夹内文件也会被删除)吗？" onConfirm={this.handleDeleteFile}>
                <Button icon="delete" type="primary" ghost>删除</Button>
              </Popconfirm>
              <Popconfirm placement="bottomLeft" title={this.setNameInput()} icon={<Icon type="edit" />} onConfirm={this.handleSetName}>
                <Button type="primary" ghost disabled={chooseFiles.length > 1} onClick={this.handleReNameButton}>重命名</Button>
              </Popconfirm>
              <Button type="primary" ghost onClick={this.handleFolderModal}>移动到</Button>
            </Button.Group>
          )}
          <Upload
            action={uploadSrc}
            onChange={this.uploadChange}
            listType="picture"
            fileList={this.state.uploadFileList}
            beforeUpload={this.beforeUploadChange}
            multiple
          >
            <Button icon="upload" type="primary" style={{ marginRight: 8 }}>
              上传
              </Button>
          </Upload>
        </div>
        <br />
        <Breadcrumb separator=">">
          {!!breadcrumbs && !!breadcrumbs.length && (
            breadcrumbs.map((info, index) => {
              if (index < (breadcrumbs.length - 1)) {
                return (
                  <Breadcrumb.Item key={info.id}>
                    <a onClick={() => this.clickBreadcrumb(info.id, index)} style={{ color: '#4287ed' }}>{info.name}</a>
                  </Breadcrumb.Item>
                );
              } else {
                return (<Breadcrumb.Item key={info.id}>{info.name}</Breadcrumb.Item>);
              }
            })
          )}
        </Breadcrumb>
        <br />
        {vmode === 'list' ? this.showListFile() : this.showGridFile()}
        <Modal
          visible={this.state.imgModalVisble}
          footer={null}
          onCancel={this.handleImgModalCancel}
        >
          <img alt={this.state.previevFile.name} style={{ width: '100%' }} src={this.state.previevFile.src} />
        </Modal>
        <FoldersModal
          title="移动到"
          visible={this.state.foldersModalVisible}
          onClickOk={this.handleMoveOk}
          onClickCancel={this.handleMoveCancel}
          chooseFiles={this.state.chooseFiles}
        />
      </Card>
    );
  }
}

export default Files;