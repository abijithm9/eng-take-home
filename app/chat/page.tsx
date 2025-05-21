'use client'

import { useState, useRef, useEffect } from 'react'
import {
	Box,
	TextField,
	IconButton,
	Paper,
	Typography,
	Container,
	CircularProgress,
	Alert,
	Snackbar,
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import SendIcon from '@mui/icons-material/Send'
import axios from 'axios'

interface Message {
	text: string
	isUser: boolean
	error?: boolean
}

const theme = createTheme()

export default function ChatPage() {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const handleSend = async () => {
		if (input.trim()) {
			const userMessage = input
			setMessages((prev) => [
				...prev,
				{ text: userMessage, isUser: true },
			])
			setInput('')
			setIsLoading(true)
			setError(null)

			try {
				const response = await axios.post('/api/chat', {
					message: userMessage,
				})
				setMessages((prev) => [
					...prev,
					{ text: response.data.response, isUser: false },
				])
			} catch (error) {
				console.error('Error:', error)
				setMessages((prev) => [
					...prev,
					{
						text: 'Sorry, I encountered an error while processing your request.',
						isUser: false,
						error: true,
					},
				])
				setError('Failed to get response. Please try again.')
			} finally {
				setIsLoading(false)
			}
		}
	}

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSend()
		}
	}

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Container
				maxWidth='md'
				sx={{ height: '100vh', py: 2 }}
			>
				<Paper
					elevation={3}
					sx={{
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						p: 2,
					}}
				>
					<Box
						sx={{
							flex: 1,
							overflowY: 'auto',
							mb: 2,
							display: 'flex',
							flexDirection: 'column',
							gap: 2,
							'&::-webkit-scrollbar': {
								width: '8px',
							},
							'&::-webkit-scrollbar-track': {
								background: '#f1f1f1',
								borderRadius: '4px',
							},
							'&::-webkit-scrollbar-thumb': {
								background: '#888',
								borderRadius: '4px',
								'&:hover': {
									background: '#555',
								},
							},
						}}
					>
						{messages.map((message, index) => (
							<Box
								key={index}
								sx={{
									display: 'flex',
									justifyContent: message.isUser
										? 'flex-end'
										: 'flex-start',
								}}
							>
								<Paper
									elevation={1}
									sx={{
										p: 2,
										maxWidth: '70%',
										backgroundColor: message.isUser
											? 'primary.main'
											: 'grey.100',
										color: message.isUser
											? 'white'
											: 'text.primary',
										border: message.error
											? '1px solid #ff6b6b'
											: 'none',
									}}
								>
									<Typography>{message.text}</Typography>
								</Paper>
							</Box>
						))}
						{isLoading && (
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'flex-start',
									gap: 1,
									alignItems: 'center',
								}}
							>
								<CircularProgress size={20} />
								<Typography
									variant='body2'
									color='text.secondary'
								>
									Processing your request...
								</Typography>
							</Box>
						)}
						<div ref={messagesEndRef} />
					</Box>

					<Box sx={{ display: 'flex', gap: 1 }}>
						<TextField
							fullWidth
							variant='outlined'
							placeholder='Type your message...'
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyPress={handleKeyPress}
							multiline
							maxRows={4}
							disabled={isLoading}
						/>
						<IconButton
							color='primary'
							onClick={handleSend}
							sx={{ alignSelf: 'flex-end' }}
							disabled={isLoading}
						>
							<SendIcon />
						</IconButton>
					</Box>
				</Paper>

				<Snackbar
					open={!!error}
					autoHideDuration={6000}
					onClose={() => setError(null)}
				>
					<Alert
						onClose={() => setError(null)}
						severity='error'
						sx={{ width: '100%' }}
					>
						{error}
					</Alert>
				</Snackbar>
			</Container>
		</ThemeProvider>
	)
}
