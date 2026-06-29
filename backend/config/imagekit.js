import ImageKit from 'imagekit';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

let imagekit = null;

if (publicKey && privateKey && urlEndpoint) {
  imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
  console.log('ImageKit connected successfully!');
} else {
  console.warn('⚠️  ImageKit keys not configured — image uploads will use local storage only.');
}

export default imagekit;