import express from 'express';
import {typesenseRouter} from './typesense_router.js'
import { join, dirname } from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

import * as dotenv from 'dotenv'
dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outdir = (process.env.OUT_DIR==null)?"../react-client/build":process.env.OUT_DIR
const abs_oudir = join(__dirname,outdir)

const app = express();
app.use(express.json());
app.use(cors());
app.use(typesenseRouter)
if(process.env.SERVER_STATIC == "true"){
    console.log(`* serving ${abs_oudir}`)
    app.use(express.static(abs_oudir))
}
app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
})

console.log(`* listening on http://${process.env.HOST}:${process.env.SERVER_PORT}`)
app.listen(process.env.SERVER_PORT);
