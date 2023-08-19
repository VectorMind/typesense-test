import express from 'express'
import { Client } from 'typesense';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import * as dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const config_path = join(__dirname,'..','.env')
dotenv.config({path:config_path})

const typesenseClient = new Client({
  nodes: [
    {
      host: process.env.HOST,
      port: process.env.TYPESENSE_PORT,
      protocol: 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY,
  numRetries: 10,
  connectionTimeoutSeconds: 10,
  retryIntervalSeconds: 1,
  healthcheckIntervalSeconds: 20,
  logLevel: "debug",
});

const search = async (req,res)=>{
    try {
        const searchParameters = {
            'q'         : req.body.q,
            'query_by'  : 'title,authors',
            'filter_by' : 'pageCount:>100',
            'sort_by'   : 'pageCount:desc'
            }
        const searchResult = await typesenseClient.collections('books').documents().search(searchParameters);
        res.json(searchResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
}
  
const typesenseRouter = express.Router()

typesenseRouter.post('/search',search);

export{
    typesenseRouter
}
