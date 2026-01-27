const asyncHandler = require("express-async-handler");
const NewLaunch = require("../../models/newLaunchModel");

const createNewLaunch = asyncHandler(async(req, res) => {
    try {
        const {name, configuration, starting_price, tagline, status} = req.body;
        const newLaunch = await NewLaunch.create({name, configuration, starting_price, tagline, status})
        res.status(201).json(newLaunch);
    } catch (error) {
        console.log(error)
    }
})
const updateNewLaunch = asyncHandler(async(req, res) => {
    try {
        const {name, configuration, starting_price, tagline, status} = req.body;
        const {id} = req.params;
        const newLaunch = await NewLaunch.findByIdAndUpdate(id, {name, configuration, starting_price, tagline, status})
        res.status(201).json(newLaunch);
    } catch (error) {
        console.log(error)
    }
})

const getNewLaunch = asyncHandler(async(req, res) => {
    try {
        let condition = {};
        const {name, status, page = 1, limit = 10, } = req.query;
         if(name){
            condition['name'] = { $regex: `^${name}$`, $options: "i" };
         }
         if (status) {
            condition['status'] = status;
          }
          if (status == 'all') {
            delete condition['status']
          }
        const newLaunch = await NewLaunch.find(condition)
        const totalCount = await NewLaunch.countDocuments(condition)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({createdAt: -1});  
        res.status(200).json({
            message: 'All Ad',
            data: newLaunch,
            totalCount
        });
    } catch (error) {
        console.log(error)
    }
})

const deleteNewLaunch = asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const new_launch = await NewLaunch.deleteById(id)
        res.status(200).json({message: "delete successfully", data: new_launch})
    } catch (error) {
        console.log(error)
    }
})
const getNewLaunchById = asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const new_launch = await NewLaunch.findById(id)
        res.status(200).json({message: "New Launch By Id", data: new_launch})
    } catch (error) { 
        console.log(error)
    }
})
const changeStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const projects = await NewLaunch.findById(id);
  
      if (!projects) {
        return res.status(404).json({ error: "projects not found" });
      }
      projects.status = status;
      await projects.save();
      return res.status(200).json({ message: "Status updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update status" });
    }
  });
module.exports = {createNewLaunch, updateNewLaunch, getNewLaunch, deleteNewLaunch, getNewLaunchById, changeStatus};