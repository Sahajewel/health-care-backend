import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    cloudinary:{
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KRY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    jwt_secret:process.env.JWT_SECRET,
    jwt_access_expires: process.env.JWT_ACCESS_EXPIRES,
    jwt_refresh_expires: process.env.JWT_REFRESH_EXPIRES,
}