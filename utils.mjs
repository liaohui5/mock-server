import { fileURLToPath } from 'url';
import { dirname } from 'path';

// like __dirname variable
export const __$dirname = () => dirname(fileURLToPath(import.meta.url))

// like __filename variable
export const __$filename = () => fileURLToPath(import.meta.url)