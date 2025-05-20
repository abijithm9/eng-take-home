'use client'

import { useState } from 'react'
import {
	Box,
	TextField,
	IconButton,
	Paper,
	Typography,
	Container,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

interface Message {
	text: string
	isUser: boolean
}

export default function ChatPage() {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')

	const handleSend = () => {
		if (input.trim()) {
			setMessages([...messages, { text: input, isUser: true }])
			setInput('')
		}
	}

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSend()
		}
	}

	return (
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
									backgroundColor: !message.isUser
										? 'primary.main'
										: 'grey.100',
									color: message.isUser
										? 'white'
										: 'text.primary',
								}}
							>
								<Typography>{message.text}</Typography>
							</Paper>
						</Box>
					))}
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
					/>
					<IconButton
						color='primary'
						onClick={handleSend}
						sx={{ alignSelf: 'flex-end' }}
					>
						<SendIcon />
					</IconButton>
				</Box>
			</Paper>
		</Container>
	)
}
