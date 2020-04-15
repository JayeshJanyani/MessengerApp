import React, { Component } from 'react'
import { Segment, Comment } from 'semantic-ui-react'
import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import firebase from '../../firebase'
import Message from './Message'
import { connect } from 'react-redux'
import { setUserPosts } from '../../actions'
import Typing from './Typing'
import Skeleton from './Skeleton'

class Messages extends Component {

    constructor(props) {
        super(props)

        this.state = {
            privateChannel: this.props.isPrivateChannel,
            privateMessagesRef: firebase.database().ref('privateMessages'),
            messagesRef: firebase.database().ref('messages'),
            channel: this.props.currentChannel,
            user: this.props.currentUser,
            usersRef: firebase.database().ref('users'),
            messages: [],
            messagesLoading: true,
            isChannelStarred: false,
            progressBar: false,
            numUniqueUsers: '',
            searchTerm: '',
            searchLoading: false,
            searchResults: [],
            typingRef: firebase.database().ref('typing'),
            typingUsers: [],
            connectedRef: firebase.database().ref('.info/connected'),
            listeners: []
        }
    }
    componentDidMount() {
        const { channel, user, listeners } = this.state
        if (channel && user) {
            this.removeListeners(listeners)
            this.addListeners(channel.id)
            this.addUserStarsListener(channel.id, user.uid)

        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.messagesEnd) {
            this.scrollToBottom()
        }
    }

    componentWillMount() {
        this.removeListeners(this.state.listeners)
        this.state.connectedRef.off()
    }

    removeListeners=listeners=>{
        listeners.forEach(listener=>{
            listener.ref.child(listener.id).off(listener.event)
        })
    }

    addToListeners=(id, ref, event)=>{
        const index=this.state.listeners.findIndex(listener=>{
            return listener.id===id && listener.ref===ref && listener.event===event
        })

        if(index===-1){
            const newListener={id,ref,event};
            this.setState({ listeners: this.state.listeners.concat(newListener)})
        }
    }
    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: 'smooth' })
    }

    addListeners = (channelId) => {

        this.addMessageListener(channelId)
        this.addTypingListeners(channelId)
    }

    addTypingListeners = channelId => {
        let typingUsers = []
        this.state.typingRef.child(channelId).on('child_added', snap => {
            if (snap.key !== this.state.user.uid) {
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                })
                this.setState({ typingUsers })
            }
        })

        this.addToListeners(channelId,this.state.typingRef,'child_added')

        this.state.typingRef.child(channelId).on('child_removed', snap => {
            const index = typingUsers.findIndex(user => user.id === snap.key)
            if (index !== -1) {
                typingUsers = typingUsers.filter(user => user.id !== snap.key)
                this.setState({ typingUsers })
            }
        })

        this.addToListeners(channelId,this.state.typingRef,'child_removed')

        this.state.connectedRef.on('value', snap => {
            if (snap.val() === true) {
                this.state.typingRef.child(channelId)
                    .child(this.state.user.uid)
                    .onDisconnect()
                    .remove(err => {
                        if (err != null) {
                            console.log(err)
                        }
                    })
            }
        })
    }

    addUserStarsListener = (channelId, userId) => {
        this.state.usersRef.child(userId)
            .child('starred')
            .once('value')
            .then(data => {
                if (data.val() !== null) {
                    const channelIds = Object.keys(data.val())
                    const prevStarred = channelIds.includes(channelId)
                    this.setState({
                        isChannelStarred: prevStarred
                    })
                }
            })
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
                this.countUniqueUsers(loadedMessages);
                this.countUserPosts(loadedMessages);
            })
            this.addToListeners(channelId,ref,'child_removed')
        

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

    countUserPosts = (messages) => {

        let userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc) {
                acc[message.user.name].count += 1
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc
        }, {})
        this.props.setUserPosts(userPosts)
        // console.log(userPosts)

    }

    displayMessages = (messages) => {
        // console.table('display messages', messages)
        return messages.length > 0 && messages.map(message => {
            // console.log(message)
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

    handleStar = () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel())
    }

    starChannel = () => {
        if (this.state.isChannelStarred) {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar: this.state.channel.createdBy.avatar
                        }
                    }
                })

        } else {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove(error => {
                    if (error !== null) {
                        console.log(error)
                    }
                })
        }
    }

    displayMessagesSkeleton = loading => (
        loading ? (
            <React.Fragment>
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} />
                ))}
            </React.Fragment>
        ) : null
    )

    displayTypingUser = users => (
        users.length > 0 && users.map(user => (
            <div style={{ display: "flex", alignItems: "center", marginBottom: '0.2em' }} key={user.id}>
                <span className="user__typing"> {user.name} is Typing</span><Typing />
            </div>
        ))
    )

    render() {
        const { messagesRef, channel, user, messages, progressBar, numUniqueUsers, searchTerm,
            searchResults, searchLoading, privateChannel, isChannelStarred, typingUsers,
            messagesLoading } = this.state
        return (
            // <React.Fragment>
            <div>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                    handleStar={this.handleStar}
                    isChannelStarred={isChannelStarred} />
                <Segment >
                    <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
                        {this.displayMessagesSkeleton(messagesLoading)}
                        {/*Messages*/}
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                        {this.displayTypingUser(typingUsers)}
                        <div ref={node => { this.messagesEnd = node }}></div>
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
                {/* </React.Fragment> */}
            </div>
        )
    }
}

const mapDispatchToProps = {
    setUserPosts
}

export default connect(null, mapDispatchToProps)(Messages)
