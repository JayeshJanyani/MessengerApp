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
            privateChannel: this.props.isPrivateChannel,
            privateMessagesRef: firebase.database().ref('privateMessages'),
            messagesRef: firebase.database().ref('messages'),
            channel: this.props.currentChannel,
            user: this.props.currentUser,
            messages: [],
            messagesLoading: true,
            progressBar: false,
            numUniqueUsers: '',
            searchTerm: '',
            searchLoading: false,
            searchResults: []
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
        const ref = this.getMessagesRef()
        ref.child(channelId)
            .on('child_added', snap => {
                loadedMessages.push(snap.val())
                // console.log(loadedMessages)
                this.setState({
                    messages: loadedMessages,
                    messagesLoading: false
                })
            })
        this.countUniqueUsers(loadedMessages);
    }

    getMessagesRef = () => {
        const { messagesRef, privateMessagesRef, privateChannel } = this.state
        return privateChannel ? privateMessagesRef : messagesRef
    }

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name)
            }
            return acc;
        }, [])
        const plural = uniqueUsers.length > 1 || uniqueUsers === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`
        this.setState({ numUniqueUsers })
    }

    displayMessages = (messages) => {
        console.table('display messages', messages)
        return messages.length > 0 && messages.map(message => {
            console.log(message)
            return <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
        }
        )
    }

    isProgressBarVisible = percent => {
        if (percent > 0) {
            this.setState({ progressBar: true })
        }
        else {
            this.setState({ progressBar: false })
        }
    }

    displayChannelName = channel => {
        if (channel !== null) {
            if (this.state.privateChannel) {
                return `@${channel.name}`
            } else {
                return `#${channel.name}`
            }
        } else {
            return ''
        }
    }

    handleSearchChange = event => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true
        }, () => {
            this.handleSearchMessages()
        })
    }
    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi')
        const searchResults = channelMessages.reduce((acc, message) => {
            if (message.content && message.content.match(regex) || message.user.name.match(regex)) {
                acc.push(message)
            }
            return acc
        }, [])
        this.setState({ searchResults })
        setTimeout(() => this.setState({ searchLoading: false }), 1000)
    }


    render() {
        const { messagesRef, channel, user, messages, progressBar, numUniqueUsers, searchTerm,
            searchResults, searchLoading, privateChannel } = this.state
        return (
            <React.Fragment>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel} />
                <Segment>
                    <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
                        {/*Messages*/}
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>

                <MessageForm
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isProgressBarVisible={this.isProgressBarVisible}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        )
    }
}

export default Messages
