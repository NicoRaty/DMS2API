import { Router } from 'express';
import {getAllData, getDataById, addData} from '../db/db.js';
let router = Router()

router.get('/', async (req, res) => {
    res.json( await getAllData() )
})

router.get('/:id', async (req, res) => {
    res.json( await getDataById(req.params.id) )
})

router.post('/', async (req, res) => {
    let [exist] = await getDataById(req.body.id)
    if( exist ) {
        res.status(409).json( {"error": "record already exists"});
    } else {
        let result = await addData(req.body);
        if(result)
            res.json(req.body);
        else
            res.status(500).json({"error": "unknown database error"})
    }
})

export default router;