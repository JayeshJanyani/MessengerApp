import React, { Component } from 'react'
import { Segment, Comment } from 'semantic-ui-react'
import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import firebase from '../../firebase'
import Message from './Message'

class Messages extends Component {

    constructor(props) {
        super(props)

        this.state = {
            messagesRef: firebase.database().ref('messages'),
            channel: this.props.currentChannel,
            user: this.props.currentUser,
            messages:[],
            messagesLoading:true
        }
    }
    componentDidMount() {
        const { channel, user } = this.state
        if (channel && user) {
            this.addListeners(channel.id)
        }
    }

    addListeners = (channelId) => {

        this.addMessageListener(channelId)
    }

    addMessageListener = (channelId) => {
        let loadedMessages = []
        this.state.messagesRef.child(channelId)
            .on('child_added', snap => {
                loadedMessages.push(snap.val())
                // console.log(loadedMessages)
                this.setState({
                    messages: loadedMessages,
                    messagesLoading:false
                })
            })
    }

    displayMessages=(messages)=>{
        console.table('display messages',messages)
        return messages.length>0 && messages.map(message => {
            console.log(message)
            return <Message 
            key={message.timestamp}
            message={message}
            user={this.state.user}
            />
        }
        )
    }

    render() {
        const { messagesRef, channel, user , messages} = this.state
        return (
            <React.Fragment>
                <MessagesHeader />
                <Segment>
                    <Comment.Group className="messages">
                        {/*Messages*/}
                        {this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>

                <MessageForm
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user} />
            </React.Fragment>
        )
    }
}

export default Messages
