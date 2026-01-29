import { Router } from 'express';
import {getAllData, getDataById, addData, deleteDataById, updateData} from '../db/db.js';
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

router.delete('/:id', async (req, res) => {
    try {
        let result = await deleteDataById(req.params.id);
        if(result && result.affectedRows > 0) {
            res.json({"message": "record deleted successfully"});
        } else {
            res.status(404).json({"error": "record not found"});
        }
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({"error": "database error"})
    }
})

router.put('/:id', async (req, res) => {
    try {
        let result = await updateData({
            id: req.params.id,
            Firstname: req.body.Firstname,
            Surname: req.body.Surname
        });
        if(result && result.affectedRows > 0) {
            res.json({"message": "record updated successfully"});
        } else {
            res.status(404).json({"error": "record not found"});
        }
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({"error": "database error"})
    }
})

export default router;