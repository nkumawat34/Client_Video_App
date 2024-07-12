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
    
    <form onSubmit={handlesubmitform} className="text-center mt-5">
    <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2 mx-3">
            Email-Id
        </label>
        <input
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
    </div>
    <div className="mb-4">
        <label htmlFor="room" className="block text-gray-700 text-sm font-bold mb-2 mx-3">
            Room<br /> Number
        </label>
        <input
            type="text"
            onChange={(e) => setRoom(e.target.value)}
            className="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
    </div>
    <button className="btn btn-primary mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Join Now
    </button>
</form>

    </>
  )
}
