import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Avatar, List, ListItem, ListItemAvatar, ListItemText, CircularProgress } from '@mui/material';
import axios from 'axios';

export const ProjectComments: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const res = await axios.get('/api/analytics/comments/', { params: { project: projectId } });
      setComments(res.data);
      setLoading(false);
    };
    fetchComments();
  }, [projectId]);

  const handleAdd = async () => {
    await axios.post('/api/analytics/comments/', {
      content,
      project: projectId,
      parent: replyTo,
    });
    setContent('');
    setReplyTo(null);
    const res = await axios.get('/api/analytics/comments/', { params: { project: projectId } });
    setComments(res.data);
  };

  const renderReplies = (replies: any[]) => (
    <List sx={{ pl: 4 }}>
      {replies.map((c) => (
        <ListItem alignItems="flex-start" key={c.id}>
          <ListItemAvatar><Avatar>{c.user[0]}</Avatar></ListItemAvatar>
          <ListItemText
            primary={<Typography fontWeight={700}>{c.user}</Typography>}
            secondary={<>
              <Typography variant="body2">{c.content}</Typography>
              <Typography variant="caption" color="text.secondary">{new Date(c.created_at).toLocaleString()}</Typography>
              <Button size="small" onClick={() => setReplyTo(c.id)}>Ответить</Button>
            </>}
          />
          {c.replies && c.replies.length > 0 && renderReplies(c.replies)}
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box mt={4}>
      <Typography variant="h6" mb={2}>Комментарии</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          label={replyTo ? "Ответ на комментарий" : "Добавить комментарий"}
          value={content}
          onChange={e => setContent(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleAdd} disabled={!content.trim()}>Отправить</Button>
        {replyTo && <Button onClick={() => setReplyTo(null)} sx={{ ml: 2 }}>Отмена</Button>}
      </Paper>
      {loading ? <CircularProgress /> : comments.length === 0 ? <Typography color="text.secondary">Нет комментариев</Typography> : (
        <List>
          {comments.map((c) => (
            <ListItem alignItems="flex-start" key={c.id}>
              <ListItemAvatar><Avatar>{c.user[0]}</Avatar></ListItemAvatar>
              <ListItemText
                primary={<Typography fontWeight={700}>{c.user}</Typography>}
                secondary={<>
                  <Typography variant="body2">{c.content}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(c.created_at).toLocaleString()}</Typography>
                  <Button size="small" onClick={() => setReplyTo(c.id)}>Ответить</Button>
                </>}
              />
              {c.replies && c.replies.length > 0 && renderReplies(c.replies)}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};