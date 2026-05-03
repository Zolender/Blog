import {Response, NextFunction } from "express";
import { authRequest } from "../types/index.js";
import pool from "../config/db.js";



//toggling like on a specific post(through id)
export const toggleLike = async (req: authRequest, res: Response, next: NextFunction)=>{
    try{
        const post_id = Number(req.params.id)
        const user_id = req.user!.id 

        const postExists = await pool.query("SELECT id FROM posts WHERE id=$1", [post_id])
        if(postExists.rows.length===0){
            res.status(404).json({message: "Post not found"})
            return
        }
        //check if the value exists, if it does, that means the user liked the post before, we then would 
        // need to delete that record so that it doesnt COUNT
        // if it doesn't exist, then let's just add it and yeah
        const existing = await pool.query("SELECT * FROM likes WHERE user_id = $1 AND post_id=$2", [user_id, post_id])
        if(existing.rows.length===0){
            await pool.query("INSERT INTO likes (user_id, post_id) VALUES ($1,$2)", [user_id, post_id])
            res.status(200).json({message: "Post liked", liked: true})
        }else{
            await pool.query("DELETE FROM likes WHERE user_id = $1 AND post_id = $2", [user_id, post_id])
            res.status(200).json({message: "Post unliked", liked: false})
        }
    }catch(err){
        next(err)
    }
}