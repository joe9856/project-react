import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase'; // Adjust the firebase import path as necessary
import { collection, getDocs, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const QuestionAnswers = () => {
  const { cid, checkInId } = useParams();
  const [classroomName, setClassroomName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isQuestionVisible, setIsQuestionVisible] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestionShow = async () => {
      try {
        const docRef = doc(db, `classroom/${cid}/checkin/${checkInId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setIsQuestionVisible(docSnap.data().question_show ?? true); // Use default value as true
        }
      } catch (err) {
        console.error('Error fetching question visibility:', err);
      }
    };

    fetchQuestionShow();
  }, [cid, checkInId]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const questionsRef = collection(db, `classroom/${cid}/checkin/${checkInId}/questions`);
        const questionSnap = await getDocs(questionsRef);

        if (!questionSnap.empty) {
          const fetchedQuestions = questionSnap.docs.map(doc => {
            const data = doc.data();
            return {
              id: data.question_no || 'ไม่มีหมายเลขคำถาม',
              text: data.question_text || 'ไม่มีข้อความคำถาม',
            };
          });

          setQuestions(fetchedQuestions);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('ไม่สามารถดึงข้อมูลคำถามได้');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [cid, checkInId]);

  useEffect(() => {
    if (!selectedQuestion) return;

    const answersPath = `classroom/${cid}/checkin/${checkInId}/questions/${selectedQuestion}/answers`;
    
    const unsubscribe = onSnapshot(
      collection(db, answersPath),
      (snapshot) => {
        const answersData = snapshot.docs.map(doc => ({
          studentId: doc.id,
          text: doc.data().answer_text || 'ไม่มีคำตอบ',
          timestamp: doc.data().timestamp ? new Date(doc.data().timestamp.toDate()) : null
        }));

        answersData.sort((a, b) => (a.timestamp && b.timestamp ? a.timestamp - b.timestamp : 0));
        setAnswers(answersData);
      },
      (err) => {
        console.error('Error listening to answers:', err);
        setError('เกิดข้อผิดพลาดในการติดตามคำตอบ');
      }
    );

    return () => unsubscribe();
  }, [cid, checkInId, selectedQuestion]);

  const toggleQuestionVisibility = async () => {
    try {
      const checkInDocRef = doc(db, `classroom/${cid}/checkin/${checkInId}`);
      await updateDoc(checkInDocRef, {
        question_show: !isQuestionVisible,
      });

      setIsQuestionVisible(!isQuestionVisible);
    } catch (err) {
      console.error('Error updating question visibility:', err);
      setError('เกิดข้อผิดพลาดในการอัปเดตสถานะการแสดงคำถาม');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'ไม่ระบุเวลา';
    return date.toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ color: '#1d1d1d' }}>คำถาม-คำตอบ</h1>
        <h5 className="text-muted">{classroomName} | การเช็คชื่อครั้งที่ {checkInId}</h5>
      </div>
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card shadow-sm">
              <div className="card-header" style={{ backgroundColor: '#17a2b8', color: 'white' }}>
                <h5 className="mb-0">รายการคำถาม</h5>
              </div>
              <div className="list-group list-group-flush">
                {questions.length > 0 ? (
                  questions.map(question => (
                    <button
                      key={question.id}
                      className={`list-group-item list-group-item-action ${selectedQuestion === question.id ? 'active' : ''}`}
                      onClick={() => setSelectedQuestion(question.id)}
                      style={{ backgroundColor: selectedQuestion === question.id ? '#e9ecef' : 'white' }}
                    >
                      คำถามที่ {question.id}
                    </button>
                  ))
                ) : (
                  <div className="list-group-item">ไม่มีคำถาม</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-9">
            {selectedQuestion && (
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#6c757d', color: 'white' }}>
                  <h5 className="mb-0">คำถามที่ {selectedQuestion}</h5>
                  <button onClick={toggleQuestionVisibility} className="btn btn-light btn-sm">
                    {isQuestionVisible ? 'ซ่อน' : 'แสดง'}
                  </button>
                </div>
                {isQuestionVisible && (
                  <div className="card-body">
                    <p className="card-text">{questions.find(q => q.id === selectedQuestion)?.text || 'ไม่พบข้อมูลคำถาม'}</p>
                  </div>
                )}
              </div>
            )}

            <div className="card">
              <div className="card-header" style={{ backgroundColor: '#28a745', color: 'white' }}>
                <h5 className="mb-0">คำตอบจากนักศึกษา</h5>
                <span className="badge bg-light text-dark">{answers.length} คำตอบ</span>
              </div>
              <div className="card-body p-0">
                {answers.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">รหัสนักศึกษา</th>
                          <th scope="col">คำตอบ</th>
                          <th scope="col">เวลา</th>
                        </tr>
                      </thead>
                      <tbody>
                        {answers.map((answer, index) => (
                          <tr key={answer.studentId}>
                            <th scope="row">{index + 1}</th>
                            <td>{answer.studentId}</td>
                            <td>{answer.text}</td>
                            <td>{formatDate(answer.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-muted mb-0">ยังไม่มีคำตอบจากนักศึกษา</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionAnswers;