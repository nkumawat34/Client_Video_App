import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider.'
import { useNavigate } from 'react-router'
export default function Lobby() {
    const [email,setEmail]=useState('')
    const [room,setRoom]=useState('')
    const socket=useSocket()
    const navigate=useNavigate()
    const handlesubmitform=(e)=>{

        e.preventDefault();
        
        socket.emit('room:join',{email,room})

    }
    useEffect(()=>{

        socket.on("room:join",handlejoinroom);
        return ()=>{
            socket.off('room:join',handlejoinroom)
        }
    },[socket])
    const handlejoinroom=useCallback((data)=>{
        const {email,room}=data
        navigate('/room/'+room)

    },[navigate])
    
    
  return (
    <>
    
    <form onSubmit={handlesubmitform} style={{textAlign:"center"}}>

        <label htmlFor='email' className='mx-3'>
            Email-Id
        </label>
        <input type="email" id="email" onChange={(e)=>setEmail(e.target.value)}></input>
        <br/>
        <label htmlFor='room' className='mx-3'>
            Room<br/> Number
        </label>
       
        <input type='text' onChange={(e)=>setRoom(e.target.value)} ></input>
        <br/>
        <button className='btn btn-primary mt-3'>Join Now</button>
    </form>
    </>
  )
}
