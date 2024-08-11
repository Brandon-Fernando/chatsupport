'use client'
import { Stack, Box, TextField, Button, CircularProgress, Typography } from "@mui/material";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Head from 'next/head';
import SendIcon from '@mui/icons-material/Send';
import { db } from "@/firebase";
import { collection, addDoc, doc, updateDoc, getDocs } from 'firebase/firestore';



export default function Home() {
  const [messages, setMessages] = useState([
    {
    role: 'assistant',
    content: `Hi, I'm the Gainful Support Agent, how can I assist you today?`,
    },
  ])

  const [message, setMessage] = useState('')
  const [docId, setDocId] = useState(null);  // State to track the document ID
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false)

  const saveConversation = async (conversation) => {
    try {
      const docRef = await addDoc(collection(db, 'conversations'), {
        messages: conversation,
        timestamp: new Date(),
      });
      console.log('Conversation saved with ID: ', docRef.id);
      setDocId(docRef.id);  // Store the document ID
      return docRef.id;
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const updateConversation = async (docId, conversation) => {
    try {
      const docRef = doc(db, 'conversations', docId);
      await updateDoc(docRef, {
        messages: conversation,
        timestamp: new Date(),
      });
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  };

  const sendMessage = async() => {
      const newMessages = [
      ...messages,
      {role: "user", content: message}, 
      {role: "assistant", content: ''}
    ]

  setMessage('');
  setMessages(newMessages);

  let currentDocId = docId
  
  if (selectedConversation && !isNewChat) {
    await updateConversation(selectedConversation.id, newMessages);
  } else {
    currentDocId = await saveConversation(newMessages);
    setSelectedConversation({ id: currentDocId, messages: newMessages });
    setIsNewChat(false)
  }

    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result =''


      return reader.read().then(function processText({done, value}){
        if (done) {
          if(currentDocId){
            updateConversation(currentDocId, newMessages)
          } else {
            saveConversation(newMessages)
          }
          return result
        }

        
        const text = decoder.decode(value || new Int8Array(), {stream: true})
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          const updatedMessages = [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            },
          ]
          if(currentDocId){
            updateConversation(currentDocId, updatedMessages);
          }
          return updatedMessages;
        })
        return reader.read().then(processText)
      })
    })

  }

  const handleKeyPress = (event) => {
    if (event.key == 'Enter' && !event.shiftKey){
      event.preventDefault()
      sendMessage()
    }
  }
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])


  useEffect(() => {
    const fetchConversations = async () => {
      const querySnapshot = await getDocs(collection(db, 'conversations'));
      const fetchedConversations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(fetchedConversations);
    };
  
    fetchConversations();
  }, []);


  useEffect(() => {
    if (selectedConversation && !isNewChat) {
      setMessages(selectedConversation.messages);
    } else {
      setMessages([{
        role: 'assistant',
        content: `Hi, I'm the Gainful Support Agent, how can I assist you today?`,
      }]);
    }
  }, [selectedConversation, isNewChat]);


  return(
    <>
    <Box
    width="100vw"
    height="100vh"
    bgcolor="#F8F4F0"
    display="flex"
    flexDirection="column"
    >

      {/* header */}
      <Box
      maxWidth
      height={90}
      bgcolor={"#204D46"}
      display="flex" 
      alignItems="center"
      justifyContent="center"
      >

        <Box
          component="img"
          sx={{
            height: 50,
            width: 50,
            
          }}
          
          alt="Logo"
          src="https://www.gainful.com/_next/image/?url=https%3A%2F%2Fdlye1hka1kz5z.cloudfront.net%2F_next%2Fstatic%2Fmedia%2Flogo-light.082ab69b.webp&w=1200&q=75"
        />
      </Box>
      
      <Box
      sx={{flex: 1}}
      m={5}
      display="flex"
      flexDirection={"row"}
      gap={10}
      >
        {/* Chat History */}
        <Box
        width={320}
        height="100%"
        bgcolor={"white"}
        borderRadius={3}
        display="flex"
        alignItems={"center"}
        flexDirection="column"
        >
          <Typography
          my={2}
          fontWeight="bold"
          >
            Chat History
          </Typography>
          
          <Box
    width={270}
    mb={4}
  >
    <TextField
      placeholder="Search chats"
      bgcolor="#F5F5F5"
      fullWidth
      sx={{
        "& fieldset": { border: 'none' },
        '& .MuiInputBase-input': {
          backgroundColor: '#F5F5F5',
        },
        '&:hover fieldset': {
          borderColor: 'green',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#204D46',
        }
      }}
    />
  </Box>
  
  <Box
      width={270}
      height={60}
      bgcolor="#F5F5F5"
      borderRadius={3}
      display="flex"
      alignItems={"center"}
      justifyContent={"center"}
      mb={2}
      onClick={() => {
        setSelectedConversation(null)
        setIsNewChat(true)
      }}
      sx={{ cursor: 'pointer' }}
    >
      <Typography variant="h2" color={"#7F928F"}>
        +
      </Typography>
    </Box>

  <Stack spacing={2} width={270} height={360} overflow="auto" >
    {conversations.map((conversation) => (
      <Box
        key={conversation.id}
        width="100%"
        height={100}
        borderRadius={3}
        p={2}
        bgcolor={selectedConversation?.id === conversation.id ? "#204D46" : "#F5F5F5"}
        onClick={() => setSelectedConversation(conversation)}
        sx={{ cursor: 'pointer', 
       }}
      >
        {/* <Typography variant="h6" color="white">
          {format(conversation.timestamp.toDate(), 'PPpp')}
        </Typography> */}
        <Typography variant="body2" color={selectedConversation?.id === conversation.id ? "white" : "#7F928F"}>
          {conversation.messages[conversation.messages.length - 1]?.content.substring(0, 50)}...
        </Typography>
      </Box>
    ))}
    </Stack>
    
  

        </Box>

        {/* Chat */}
        <Stack
        sx={{flex: 1}}
        height="100%"
        direction="column"
        p={2}
        spacing={2}
        
        >
          <Stack 
        direction="column"
        spacing={2}
        flexGrow={1}
        overflow="auto"
        maxHeight={540}>
          {
            messages.map((message, index) => (
              <Box key={index} display = "flex" justifyContent={
                message.role == 'assistant' ? 'flex-start' : 'flex-end'
              }>
                <Box bgcolor={
                  message.role == 'assistant' ? 'white' : '#204D46'
                }
                color={message.role == 'assistant' ? 'black' : 'white'}
                borderRadius={4}
                px={3}
                py={2}
                fontSize={13}>
                  {message.content}
                </Box>
              </Box>
            ))
          }
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField 
          placeholder="Ask a question"
          bgcolor="white"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            "& fieldset": { border: 'none' },
            '& .MuiInputBase-input': {
              backgroundColor: 'white', 
            },
            '&:hover fieldset': {
              borderColor: 'green', 
            },
            '&.Mui-focused fieldset': {
              borderColor: '#204D46', 
            }
          }}
          />
          <Button 
          variant="outlined"
          onClick={sendMessage}
          sx={{bgcolor: "#edff79", borderColor: "#edff79", color: "black",
              '&:hover':{bgcolor: "#76915e", borderColor: "#76915e"} }}
          endIcon={<SendIcon />}
          >Send</Button>
          
        </Stack>
          
        </Stack>
      </Box>
    </Box>


    </>
  )
}
