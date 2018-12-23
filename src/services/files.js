import request from '../utils/request'

export async function getFilesOrFolders(params) {
    return request('/api/getFilesOrFolders', {
        method: 'POST',
        body: params,
    });
}

export async function createFolder(params) {
    return request('/api/createFolder', {
        method: 'POST',
        body: params,
    });
}

export async function deleteFileList(params) {
    return request('/api/deleteFileList', {
        method: 'POST',
        body: params,
    });
}

export async function renameFile(params) {
    return request('/api/renameFile', {
        method: 'POST',
        body: params,
    });
}

export async function moveFiles(params) {
    return request('/api/moveFiles', {
        method: 'POST',
        body: params,
    });
}

export async function addFile(params) {
    return request('/api/addFile', {
        method: 'POST',
        body: params,
    });
}