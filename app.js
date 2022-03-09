require('dotenv').config()

const express=require("express");
const ejs = require("ejs");
const mongoose=require("mongoose");
const fast2sms = require('fast-two-sms')
var unirest = require("unirest");
const otpGenerator = require('otp-generator')

let newUser='LOGIN';

const smsotp=otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets:false,specialChars:false });
const app=express();
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

const url=`mongodb+srv://jonty:${process.env.DB_Password}@bhada.b8w28.mongodb.net/bhadaDatabase?retryWrites=true&w=majority`;
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  

  const formSchema = new mongoose.Schema(
    {
      
      radio1: String,
   pickupAdd: String,
   dropAdd: String,
   sendersName:String,
   senderPhnNo:String,
   recieverName:String,
   recieverPhnNo:String,
   Landmark:String,
   goodsType:String,
   quantity:String,
   PackageWeight:String
    },
    { collection: 'orderForm' }
  );
  
  const Form = mongoose.model("Form", formSchema);
  
  const driverSchema = new mongoose.Schema(
    {
      
      driverName: String,
      driverPhnNo: String,
      city: String,
      vehicleType:String,
      promo:String
    },
    { collection: 'driverForm' }
  ); 
  
  const DriverForm = mongoose.model("DriverForm", driverSchema);

  const registeredUserSchema = new mongoose.Schema(
    {
      
      RegisteredName: String,
      RegisteredPhnNo: String,
      RegisteredCity: String,
      RegisteredEmail:String
      
    },
    { collection: 'registeredForm' }
  ); 
  
  const RegisteredForm = mongoose.model("RegisteredForm", registeredUserSchema);

const urlencodedParser=bodyParser.urlencoded({extended:false})
app.set('view engine', 'ejs');

app.use(express.static("public"));

const credential={
    email:"admin@gmail.com",
    password:"admin123"
}


const URL=`mongodb+srv://jonty:12345@bhada.b8w28.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


app.get("/",function(req,res){
  
    res.render("mainPage",{user:newUser})
})

app.get("/adminLogin",function(req,res){
//res.send("server working");
res.render('login',{registeredUser:'',user:newUser});

});

// app.post("/adminLogin",function(req,res){
//     //res.send("server working");
//     if(req.body.email==credential.email && req.body.password==credential.password){
        
//             // res.render('adminpanel');
//             Form.find({}, function(err, orders) {
//               res.render('adminpanel', {
//                 OrderItemList: orders,
                
//               })
//           })
//     }
//     else{
//         res.send("invalid username");
//     }
    
//     });
//  app.get("/adminLogout",function(req,res){
//     //  req.session.destroy(function(err){
//     //      if(err){
//     //          console.log(err);
//     //          res.send("error")
//     //      }
//     //      else{
//              res.render("login",{logout:"Logout Successfully!..",user:newUser})
//     //      }
//     //  })
//  }) 
 
 
 app.get("/bookPackage",function(req,res){
    res.render("form",{user:newUser,notLogin:'you are not logged in kindly login first'})
})

app.post("/orderBooking", urlencodedParser, (req, res) => {
  let formData = new Form({
    radio1: req.body.radio1,
   pickupAdd: req.body.pickupAdd,
   dropAdd: req.body.dropAdd,
   sendersName:req.body.sendersName,
   senderPhnNo:req.body.senderPhnNo,
   recieverName:req.body.recieverName,
   recieverPhnNo:req.body.recieverPhnNo,
   Landmark:req.body.Landmark,
   goodsType:req.body.goodsType,
   quantity:req.body.quantity,
   PackageWeight:req.body.PackageWeight
});



    if(newUser==='LOGOUT'){
      formData.save();
    res.render('order_successful_page',{user:newUser});
    }
    else{
      res.render("form",{user:newUser,notLogin:'you are not logged in kindly login first'})
    }
  });

  app.post("/driverRegistration", urlencodedParser, (req, res) => {
    let driverData = new DriverForm({
      driverName: req.body.driverName,
      driverPhnNo: req.body.driverPhnNo,
      city: req.body.city,
      vehicleType:req.body.vehicleType,
      promo:req.body.promo
     
  });
  
  driverData.save();
  res.render('driver&Partner',{registered:'successfully registered you will get call soon',user:newUser})
    });
 
app.get("/customerLogin",function(req,res){
  newUser='LOGIN'
  res.render('customerLogin',{registeredUser:'',user:newUser,registerdNo:''})
})

app.get("/customerRegister",function(req,res){
  res.render('customerRegister',{user:newUser})
})
app.get("/driverPartners",function(req,res){
  res.render('driver&Partner',{registered:'',user:newUser})
})
app.get("/driver_partnerList",function(req,res){
  DriverForm.find({}, function(err, drivers) {
    res.render('driver_partnerList', {
      DriverList: drivers,
      user:newUser
    })
})
})
app.get("/customersOrdersList",function(req,res){
  Form.find({}, function(err, orders) {
    res.render('adminpanel', {
      OrderItemList: orders,
      user:newUser
    })
})
})

app.get("/registeredUserList",function(req,res){
  RegisteredForm.find({}, function(err, registeredUsers) {
    res.render('registeredUserList', {
      RegisteredUserList: registeredUsers,
      user:newUser
    })
})
})

const apikey=process.env.OTP_API_KEY;

app.post("/customerlogin1",async function(req,res){
  
  var phoneno=req.body.phn;
  console.log(phoneno);

var req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");

req.headers({
  "authorization": apikey
});

req.form({
  "variables_values": smsotp,
  "route": "otp",
  "numbers": phoneno,
});


req.end(function (res) {
  if (res.error) throw new Error(res.error);

  console.log(res.body);
  
})
//  RegisteredForm.find({RegisteredPhnNo:`${phoneno}`},function(err, data){
   
//   let databasePhn=data.RegisteredPhnNo;
const number1=await RegisteredForm.findOne({RegisteredPhnNo:phoneno})
// console.log(number1.RegisteredPhnNo);
try{
  if(number1.RegisteredPhnNo == '7610760906'){
    res.render('adminverification',{invalid:'',user:newUser})
  }
else if(number1.RegisteredPhnNo!==null){
    res.render('verification',{invalid:'',user:newUser})
  }
}
catch (error){
  res.render('customerLogin',{registeredUser:'',user:newUser,registerdNo:'number not registered'})
}
  // else
  // {
  //   res.render('customerLogin',{registeredUser:'',user:newUser,registerdNo:'number not registered'})
  // }

  // })

})

app.get("/verificationOTP",function(req,res){
  res.render('verification',{invalid:'',user:newUser})
})

app.post("/otpverification",function(req,res){
  const otpcode=req.body.otpcode;
    
  if (otpcode==smsotp){
     newUser='LOGOUT';
    res.render('mainPage',{user:newUser})
  }
  else{
   res.render('verification',{invalid:'Invalid code!!',user:newUser})
  }
})
app.post("/adminotpverification",function(req,res){
  const otpcode=req.body.otpcode;
    
  if (otpcode==smsotp){
     
    Form.find({}, function(err, orders) {
      res.render('adminpanel', {
        OrderItemList: orders,
        
      })
  })
  }
  else{
   res.render('verification',{invalid:'Invalid code!!',user:newUser})
  }
})
app.post("/userRegistration",function(req,res){
  let RegisteredData = new RegisteredForm({
    RegisteredName: req.body.FullName,
    RegisteredPhnNo: req.body.phoneNo,
    RegisteredCity: req.body.Registeredcity,
    RegisteredEmail: req.body.Registeredemail
   
});

RegisteredData.save();
res.render('customerLogin',{registeredUser:'successfully registered now login to your account',user:newUser,registerdNo:''})
})
app.listen(process.env.PORT || 3000,function(){
    console.log("server started on port 3000");
  });
