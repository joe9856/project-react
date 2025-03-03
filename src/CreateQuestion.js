import React, { useState, useEffect } from 'react';
import { 
    Button, TextField, Box, MenuItem, Select, InputLabel, 
    FormControl, Card, CardContent, Typography, Paper 
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase';
import { doc, setDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const CreateQuestion = () => {
    const { cid, cno } = useParams();
    const navigate = useNavigate();

    const [questionText, setQuestionText] = useState('');
    const [questionNo, setQuestionNo] = useState(null);
    const [questionShow, setQuestionShow] = useState(false);
    const [classroomName, setClassroomName] = useState('');

    useEffect(() => {
            const fetchQuestions = async () => {
                try {
                    const questionsCollection = collection(db, `classroom/${cid}/checkin/${cno}/questions`);
                    const questionsSnapshot = await getDocs(questionsCollection);
                    const questionNumbers = questionsSnapshot.docs.map(doc => Number(doc.id));
                    const maxQuestionNo = questionNumbers.length ? Math.max(...questionNumbers) : 0;
                    setQuestionNo(maxQuestionNo + 1);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        const fetchClassroomName = async () => {
            try {
                const classroomDocRef = doc(db, `classroom/${cid}`);
                const classroomDocSnapshot = await getDoc(classroomDocRef);
                if (classroomDocSnapshot.exists()) {
                    const data = classroomDocSnapshot.data();
                    setClassroomName(data.info?.name || '');
                }
            } catch (error) {
                console.error('Error fetching classroom name:', error);
            }
        };

        fetchQuestions();
        fetchClassroomName();
    }, [cid, cno]);

    const handleSubmit = async () => {
        if (questionNo === null) return;

        try {
            const questionRef = doc(db, `classroom/${cid}/checkin/${cno}/questions/${questionNo}`);
            await setDoc(questionRef, {
                question_no: questionNo,
                question_text: questionText,
                question_show: questionShow
            });

            console.log('Question added successfully!');
            navigate(`/classroommanagement/${cid}`);
        } catch (e) {
            console.error('Error adding question: ', e);
        }
    };

    return (
        <Box 
            sx={{
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh', 
                background: '#f5f5f5', 
                padding: 3 
            }}
        >
            <Paper 
                elevation={6} 
                sx={{
                    width: 900, 
                    padding: 4, 
                    borderRadius: 3, 
                    boxShadow: 4, 
                    background: 'rgba(255, 255, 255, 0.9)'
                }}
            >
                <Card 
                    sx={{
                        padding: 3, 
                        borderRadius: 3, 
                        boxShadow: 2, 
                        background: '#fff'
                    }}
                >
                    <CardContent>
                        <Typography 
                            variant="h5" 
                            align="center" 
                            sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}
                        >
                            ✏️ สร้างคำถามสำหรับห้องเรียน {classroomName }
                        </Typography>

                        <TextField
                            label="หมายเลขคำถาม"
                            type="number"
                            value={questionNo || ''}
                            fullWidth
                            margin="normal"
                            disabled
                            sx={{ background: '#f5f5f5', borderRadius: 1 }}
                        />

                        <TextField
                            label="คำถาม"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                            sx={{ background: '#f5f5f5', borderRadius: 1 }}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>แสดงคำถาม</InputLabel>
                            <Select
                                value={questionShow.toString()} // แปลง boolean เป็น string
                                onChange={(e) => setQuestionShow(e.target.value === 'true')}
                                sx={{ background: '#f5f5f5', borderRadius: 1 }}
                            >
                                <MenuItem value="false">ไม่แสดง</MenuItem> // ข้อความต้องตรงกับ value ที่เป็น string
                                <MenuItem value="true">แสดง</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={handleSubmit}
                                disabled={questionNo === null}
                                sx={{
                                    px: 4, 
                                    py: 1.5, 
                                    fontSize: 16, 
                                    borderRadius: 2, 
                                    fontWeight: 'bold',
                                    background: 'Green',
                                    '&:hover': { background: 'linear-gradient(to right, #ff4b2b, #ff416c)' },
                                    boxShadow: 3
                                }}
                            >
                                ✅ บันทึกคำถาม
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Paper>
        </Box>
    );
};

export default CreateQuestion;