import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import React, { useEffect } from "react";
import { useState } from "react";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { auth } from "./firebase";
import { Button, TextField } from '@mui/material'

function PhoneOTP() {
    const [phone, setPhone] = useState("")
    const [user, setUser] = useState(null)
    const [otp, setOtp] = useState("")
    
    // ล้าง reCAPTCHA เมื่อ component unmount
    useEffect(() => {
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear()
            }
        }
    }, [])

    const sendOTP = async () => {
        try {
            // ล้าง reCAPTCHA เก่าถ้ามี
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear()
            }
            
            // สร้าง reCAPTCHA ใหม่
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha", {
                size: "normal",
                callback: (response) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                },
                'expired-callback': () => {
                    // Response expired. Ask user to solve reCAPTCHA again.
                }
            })

            const formattedPhone = `+${phone}`
            const confirmation = await signInWithPhoneNumber(
                auth, 
                formattedPhone, 
                window.recaptchaVerifier
            )
            setUser(confirmation)
            console.log("OTP sent successfully")
        } catch (err) {
            console.error(err)
            // ล้าง reCAPTCHA ในกรณีที่เกิดข้อผิดพลาด
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear()
            }
        }
    }

    const verifyOTP = async () => {
        if (!user) {
            alert("กรุณาส่ง OTP ก่อน")
            return
        }
        try {
            const result = await user.confirm(otp)
            console.log("ยืนยันสำเร็จ", result)
        } catch (err) {
            console.error("การยืนยันล้มเหลว", err)
        }
    }

    return (
        <div>
            <PhoneInput
                country={'th'}
                value={phone}
                onChange={setPhone}
            />
            <Button 
                onClick={sendOTP} 
                sx={{marginTop:"10px"}} 
                variant='contained'
            >
                ส่ง OTP
            </Button>
            <br/>
            <div style={{marginTop:"10px"}} id="recaptcha"></div>
            <TextField 
                onChange={(e)=> setOtp(e.target.value)} 
                sx={{marginTop:"10px",width:"300px"}} 
                variant='outlined' 
                size='small' 
                label="กรอก OTP"
            />
            <br/>
            <Button 
                onClick={verifyOTP} 
                sx={{marginTop:"10px"}} 
                color='success' 
                variant='contained'
            >
                ยืนยัน OTP
            </Button>
        </div>
    )
}

export default PhoneOTP;