const express = require('express')
const userRouter  = require('./routes/userRoute')
const taskRouter  = require('./routes/tastRoute')
require('./db/mongoose')


const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(PORT,()=>{
    console.log(`Server is live on http://localhost:${PORT}`)
})




//Without Middleware --> New Request -> Run route handler
//With Middleware --> New Request -> Do somthing -> Run router handler