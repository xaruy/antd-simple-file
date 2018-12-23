import React, { PureComponent } from 'react';
import { Modal, Tree } from 'antd';
import { connect } from 'dva';

const { DirectoryTree, TreeNode } = Tree;

@connect(({ files, loading }) => ({
  files,
  loading: loading.models.files,
}))

class FoldersModal extends PureComponent {
  state = {
    selectId: null,
    treeData: [
      { name: '全部文件', id: 0, isDir: 1 },
    ],
  }

  onLoadData = (treeNode) => {
    const { dispatch } = this.props;
    return new Promise((resolve) => {
      if (treeNode.props.children) {
        resolve();
        return;
      }
      dispatch({
        type: 'files/fetchFolders',
        payload: {
          parentId: treeNode.props.dataRef.id,
        },
        callback: (list) => {
          treeNode.props.dataRef.children = list; // eslint-disable-line
          this.setState({
            treeData: [...this.state.treeData],
          });
          resolve();
        },
      });
    });
  }

  onSelect = (info) => {
    const id = Number(info[0]);
    this.setState({ selectId: id });
  }

  renderTreeNodes = (data) => {
    const { chooseFiles } = this.props;
    const newData = data.filter((item) => {
      return (item.isDir && chooseFiles.indexOf(item.id) === -1);
    });
    return newData.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.name} key={item.id} dataRef={item} />;
    });
  }
  render() {
    const { title, visible, onClickOk, onClickCancel } = this.props;
    return (
      <Modal
        title={title}
        visible={visible}
        onOk={() => onClickOk(this.state.selectId)}
        onCancel={onClickCancel}
      >
        <DirectoryTree loadData={this.onLoadData} onSelect={this.onSelect}>
          {this.renderTreeNodes(this.state.treeData)}
        </DirectoryTree>
      </Modal>
    );
  }
}

export default FoldersModal;
