import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const app=express(); const port=process.env.PORT||3000;
app.use(express.json({limit:'30kb'})); app.use(express.static('public'));
app.post('/api/ask',async(req,res)=>{
  const prompt=typeof req.body?.prompt==='string'?req.body.prompt.trim():'';
  if(!prompt)return res.status(400).json({error:'Please enter a question.'});
  if(prompt.length>4000)return res.status(400).json({error:'Question is too long (max 4000 characters).'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI API key is not configured. Add it to the server .env file.'});
  try{
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:'gpt-4.1-mini',input:[{role:'system',content:'You are a friendly study assistant. Explain clearly and accurately for a beginner.'},{role:'user',content:prompt}]})});
    const data=await response.json();
    if(!response.ok)return res.status(502).json({error:data?.error?.message||'AI provider request failed. Check server configuration.'});
    const answer=(data.output||[]).flatMap(item=>item.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('\\n').trim();
    if(!answer)return res.status(502).json({error:'The AI returned an empty response. Please try again.'});
    res.json({answer});
  }catch(err){console.error('AI request failed:',err.message);res.status(500).json({error:'Could not reach the AI service. Please try again.'});}
});
app.listen(port,()=>console.log(`AI Study Assistant running at http://localhost:${port}`));