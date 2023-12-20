const express = require('express');
const app = express();
const port = 8000;
const connectDB = require('./db/dbConnection');
const User = require('./db/user');
const cors = require('cors');
const District = require('./db/district');
const cron = require('node-cron');


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
//pendingList
app.get('/pendinglist', async (req, res) => {
  try {
    const { userDistrict } = req.query;
      const districts = await District.find({
          finalvalue: null,
          value:null,
          district: {$eq:userDistrict}
      });

      res.json(districts);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});
//approvalList
app.get('/approvallist', async (req, res) => {
  try {
    const { userDistrict } = req.query;
      const districts = await District.find({
          finalvalue: {$ne:null},
          value:{$ne:null},
          district: {$eq:userDistrict}
          
      });

      res.json(districts);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

//employee Retrieves all the stations
app.get('/employeeretrieve', async (req, res) => {
  try {
      const { userDistrict } = req.query;
      const query = userDistrict ? { district: userDistrict } : {};

      const districts = await District.find(query);
      res.json(districts);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

// only data which need to be approved will be retrieved 
app.get('/adminretrieve', async (req, res) => {
  try {
    const { userDistrict } = req.query;
      const districts = await District.find({
          finalvalue: null,
          value:{$ne:null},
          district: {$eq:userDistrict}
          
      });

      res.json(districts);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

//dd only retrieves values to be updated
app.get('/ddretrieve', async (req, res) => {
  try {
    const { userDistrict ,editname} = req.query;
      const districts = await District.find({
          finalvalue: null,
          value:null,
          district: {$eq:userDistrict}
      });

      res.json(districts);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

//Employee submits value to the database
  app.post('/update', async (req, res) => {
  try {
    const currentDateTime = new Date();

    const { cityId, newValue,editname} = req.body;

    // Validate cityId and newValue
    if (!cityId || !newValue) {
      return res.status(400).json({ success: false, message: 'Invalid request.' });
    }
    const formattedDateTime = currentDateTime.toLocaleString();

    // Find the city by id and update the value
    const updatedCity = await District.findByIdAndUpdate(
      cityId,
      { $set: { value: newValue , finalvalue : null, updatetime : 'UpdatedBy '+editname+' At '+formattedDateTime} },
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

//dd directly submits the value
app.post('/ddupdate', async (req, res) => {
  try {
    const currentDateTime = new Date();

    const { cityId, newValue,editname} = req.body;

    // Validate cityId and newValue
    if (!cityId || !newValue) {
      return res.status(400).json({ success: false, message: 'Invalid request.' });
    }
    const formattedDateTime = currentDateTime.toLocaleString();

    // Find the city by id and update the value
    const updatedCity = await District.findByIdAndUpdate(
      cityId,
      { $set: { value: newValue , finalvalue : newValue, updatetime : 'UpdatedBy '+editname+' At '+formattedDateTime} },
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

//district director submits the value
app.post('/adminupdate', async (req, res) => {
    try {
      const { cityId, newValue } = req.body;
        if (!cityId || !newValue) {
        return res.status(400).json({ success: false, message: 'Invalid request.' });
      }
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

//district director cancels the value
app.post('/admincancel', async (req, res) => {
    try {
      const { cityId } = req.body;
        if (!cityId) {
        return res.status(400).json({ success: false, message: 'Invalid request.' });
      }
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

//admin submits all the values
  app.post('/adminsubmitall', async (req, res) => {
    const { cityIds } = req.body;
  
    try {
      for (const cityId of cityIds) {
        const city = await District.findById(cityId);
  
        if (city) {
          await District.findByIdAndUpdate(cityId, { finalvalue: city.value });
        } else {
          console.error(`City with ID ${cityId} not found`);
        }
      }
  
      res.json({ success: true, message: 'Submit all successful' });
    } catch (error) {
      console.error('Error submitting all:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  

  //admin cancel all the values
  app.post('/admincancelall', async (req, res) => {
    const { cityIds } = req.body;
  
    try {
      for (const cityId of cityIds) {
        const city = await District.findById(cityId);
  
        if (city) {
          await District.findByIdAndUpdate(cityId, { finalvalue: null, value: null });
        } else {
          console.error(`City with ID ${cityId} not found`);
        }
      }
  
      res.json({ success: true, message: 'Submit all successful' });
    } catch (error) {
      console.error('Error submitting all:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
//employee and admin login
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
        res.status(200).json({message:'Login successful', success: true,designation:user.designation,district:user.district,username:user.username})
    }
    catch(error){
        res.status(500).json({error:'Login failed'})
    }
})

//making null

async function updateFinalValueForAllRecords(model) {
  try {
    const currentDate = new Date();
    const yearMonthKey = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const records = await model.find().exec();

    records.forEach(async (record) => {
      const filter = { _id: record._id };
      const update = {
        $set: {
          [`previousdata.${yearMonthKey}`]: record.finalvalue,
          finalvalue: null, 
          value: null
        }
      };
      await model.updateOne(filter, update);
    });
  } catch (error) {
    console.error('Error updating records:', error);
    throw error;
  }
}

//works for everyone month 1st
// cron.schedule('* * * * *', async () => {
//  await updateFinalValueForAllRecords(District);
// });
//employee Transfer
app.post('/employeetransfer', async (req, res) => {
  try {
    const { username, transferto } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure 'transfer' array exists and is initialized
    user.transfer = user.transfer || [];

    // Set the user's district
    user.district = transferto;

    // Add newdistrict to the transfer array
    user.transfer.push(transferto);

    // Save the updated user
    await user.save();

    res.json({ message: 'User district and transfer array updated successfully' });
  } catch (error) {
    console.error('Error updating records:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get all dd

app.get('/getalldd', async (req, res) => {
  try {
    const admins = await User.find({ designation: 'admin' });
    res.json(admins);
  } catch (error) {
    console.error('Error finding admins:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

connectDB();

app.listen(port,()=> {
 console.log('Server is listening on Post 8000')
});