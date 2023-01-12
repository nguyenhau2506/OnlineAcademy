import client from 'https';
import fs from 'fs';

function downloadImg(url, filePath) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filePath))
                    .on('error', reject)
                    .once('close', () => resolve(filePath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        })
    });
}

export function getAvatarWithUrl(url, filePath) {
    return downloadImg(url, filePath);
}

function stringToHexColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();
    // const h = hash % 360;
    // return 'hsl('+h+', '+s+'%, '+l+'%)';
    return "00000".substring(0, 6 - c.length) + c;
}

export function getAvatarByName(name, filePath) {
    const newName = name.trim().split(' ').splice(-2).join('+'); // Lấy 2 chữ cuối của tên
    const url = new URL(`https://ui-avatars.com/api/?name=${newName}`);
    url.searchParams.append('length', encodeURIComponent(newName.split('+').length));
    url.searchParams.append('size', encodeURIComponent(192));
    url.searchParams.append('rounded', encodeURIComponent(false));
    url.searchParams.append('bold', encodeURIComponent(true));
    url.searchParams.append('uppercase', encodeURIComponent(true));
    url.searchParams.append('background', encodeURIComponent(stringToHexColor(name)));
    url.searchParams.append('color', encodeURIComponent("fff"));
    return downloadImg(url.toString(), filePath);
}
