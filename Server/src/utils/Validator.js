const validator = require("validator")

const validateUser = (data)=>{
    
    if(!data) 
        throw new Error("User data is required.")
    
    if(!data.email)
        throw new Error("Email is required.")
    if(!data.password)
        throw new Error("Password is required.")
    if(!data.name)
        throw new Error("Name is required.")
    
    if(!validator.isEmail(data.email))
        throw new Error("Please provide a valid email address.")
    
    if(!validator.isStrongPassword(data.password))
        throw new Error("Password is too weak. Please use a stronger password.")
    
    if(data.name.length < 3 || data.name.length > 19)
        throw new Error("Name must be between 3 and 19 characters long.")
}

module.exports = validateUser;
