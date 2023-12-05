const express = require('express');
const app = express();
const port = 8000;
const connectDB = require('./db/dbConnection');
const User = require('./db/user');
const cors = require('cors');
const District = require('./db/district');

//Middleware for parsing JSON
app.use(express.json());

//Enable CORS
app.use(cors())

//Registration
app.post('/register',async(req,res) => {
    try{
        const {username,password} = req.body;
        console.log(req.body)
        const user = new User({username,password});
        await user.save();
        res.status(201).json({message:'Registration Successful'});
    }
    catch(error){
        res.status(500).json({error:'Registration failed'});
    }
})
app.get('/welcome', async (req, res) => {
    try {
       District.find().then(districts=>res.json(districts))
      
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  app.post('/update', async (req, res) => {
  try {
    const { cityId, newValue } = req.body;

    // Validate cityId and newValue
    if (!cityId || !newValue) {
      return res.status(400).json({ success: false, message: 'Invalid request.' });
    }

    // Find the city by id and update the value
    const updatedCity = await District.findByIdAndUpdate(
      cityId,
      { $set: { value: newValue } },
      { new: true }
    );

    if (!updatedCity) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    return res.status(200).json({ success: true, message: 'Value updated successfully.' });
  } catch (error) {
    console.error('Error updating value:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
//adminupdate
app.post('/adminupdate', async (req, res) => {
    try {
      const { cityId, newValue } = req.body;
  
      // Validate cityId and newValue
      if (!cityId || !newValue) {
        return res.status(400).json({ success: false, message: 'Invalid request.' });
      }
  
      // Find the city by id and update the value
      const updatedCity = await District.findByIdAndUpdate(
        cityId,
        { $set: { finalvalue: newValue } },
        { new: true }
      );
  
      if (!updatedCity) {
        return res.status(404).json({ success: false, message: 'City not found.' });
      }
  
      return res.status(200).json({ success: true, message: 'Value updated successfully.' });
    } catch (error) {
      console.error('Error updating value:', error);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  });

//admin csncel
app.post('/admincancel', async (req, res) => {
    try {
      const { cityId } = req.body;
  
      // Validate cityId and newValue
      if (!cityId) {
        return res.status(400).json({ success: false, message: 'Invalid request.' });
      }
  
      // Find the city by id and update the value
      const updatedCity = await District.findByIdAndUpdate(
        cityId,
        { $set: { value: null } },
        { new: true }
      );
  
      if (!updatedCity) {
        return res.status(404).json({ success: false, message: 'City not found.' });
      }
  
      return res.status(200).json({ success: true, message: 'Value updated successfully.' });
    } catch (error) {
      console.error('Error updating value:', error);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  });



app.post('/login',async(req,res)=>{
    try{
        const {username,password} = req.body;
        const user = await User.findOne({ username, password });
    
        if(!user){
            return res.status(401).json({error:'Invalid username or Password'},{designation:user.designation});
        }

        if(user.password !== password){
            return res.status(401).json({error:'Invalid username or password',designation:user.designation});
        }
        res.status(200).json({message:'Login successful', success: true,designation:user.designation})
    }
    catch(error){
        res.status(500).json({error:'Login failed'})
    }
})

connectDB();

app.listen(port,()=> {
 console.log('Server is listening on Post 8000')
});