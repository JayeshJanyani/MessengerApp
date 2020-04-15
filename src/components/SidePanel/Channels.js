import React, { Component } from 'react'
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react'
import firebase from '../../firebase'
import { connect } from 'react-redux'
import { setCurrentChannel, setPrivateChannel } from '../../actions/index'

class Channels extends Component {

    constructor(props) {
        super(props)

        this.state = {
            user: this.props.currentUser,
            channel: null,
            channels: [],
            channelName: '',
            channelDetails: '',
            modal: false,
            firstLoad: true,
            activeChannel: '',
            typingRef: firebase.database().ref('typing'),
            channelRef: firebase.database().ref('channels'),
            messagesRef: firebase.database().ref('messages'),
            notifications: []


        }
    }

    componentDidMount() {
        this.addListeners()
    }

    componentWillUnmount() {
        this.removeListeners()
    }

    removeListeners = () => {
        this.state.channelRef.off()
        this.state.channels.forEach(channel=>{
            this.state.messagesRef.child(channel.id).off()
        })
    }

    addListeners = () => {
        let loadedChannels = []
        //this will look for every channel that is newly added to the channelsRef
        this.state.channelRef.on('child_added', snap => {
            loadedChannels.push(snap.val())
            // console.log(loadedChannels)
            this.setState({ channels: loadedChannels },
                () => this.setFirstChannel())

            this.addNotificationListener(snap.key)
        })
    }

    addNotificationListener = channelId => {
        //this will listen to the messages that gets added to any of the channels
        this.state.messagesRef.child(channelId).on('value', snap => {
            if (this.state.channel) {
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap)
            }
        })
    }

    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0
        let index = notifications.findIndex(notification => notification.id === channelId)

        if (index !== -1) {
            if (channelId !== currentChannelId) {
                lastTotal = notifications[index].total
                if (snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal
                }
            }

        } else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            })
        }

        this.setState({ notifications })
    }

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];
        // console.log(firstChannel)

        if (this.state.firstLoad && this.state.channels.length > 0) {
            this.props.setCurrentChannel(firstChannel)
            // console.log('channel updated with', firstChannel)
            this.setActiveChannel(firstChannel)
            this.setState({channel:firstChannel})
        }
        this.setState({ firstLoad: false })
    }



    addChannel = () => {
        const { channelDetails, channelName, channelRef, user } = this.state
        const key = channelRef.push().key;
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        }

        channelRef.child(key)
            .update(newChannel)
            .then(() => {
                this.setState({ channelDetails: '', channelName: '' })
                this.closeModal()
                console.log('channel Added')
            }).catch(error => {
                console.log(error)
            })
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    closeModal = () => {
        this.setState({ modal: false })
    }

    openModal = () => {
        this.setState({ modal: true })
    }

    handleSubmit = (event) => {
        event.preventDefault()
        if (this.isFormValid(this.state)) {
            this.addChannel()
            // console.log('channel added')
        }
    }

    isFormValid = ({ channelName, channelDetails }) => {
        return channelDetails && channelName
    }

    getNotificationsCount=channel=>{
        let count=0

        this.state.notifications.forEach(notification=>{
            if(notification.id===channel.id){
                count=notification.count
            }
        })
        if(count>0) return count;
    }

    displayChannels = (channels) => (
        channels.length > 0 && channels.map(channel => (
            <Menu.Item
                key={channel.id}
                onClick={() => this.changeChannel(channel)}
                name={channel.name}
                style={{ opacity: 0.7 }}
                active={channel.id === this.state.activeChannel}
            >
                {this.getNotificationsCount(channel) && (
                    <Label color="red"> {this.getNotificationsCount(channel)}</Label>
                )}
                # {channel.name}
            </Menu.Item>
        ))
    )

    changeChannel = channel => {
        // this.props.setCurrentChannel(channel)
        this.setActiveChannel(channel)
        this.state.typingRef
        .child(this.state.channel.id)
        .child(this.state.user.uid).remove()
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false)
        this.setState({ channel })
        //whenever we change the channel, we will clear the notifications
        this.clearNotifications()
    }

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id)

        if (index !== -1) {
            let updatedNotifications = [...this.state.notifications]
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal
            updatedNotifications[index].count = 0
            this.setState({ notification: updatedNotifications })
        }
    }

    setActiveChannel = channel => {
        this.setState({ activeChannel: channel.id })
    }

    render() {
        const { channels, modal } = this.state
        return (
            <React.Fragment>
                <Menu.Menu style={{ paddingBottom: '2em' }}>
                    <Menu.Item>
                        <span>
                            <Icon name="exchange" />CHANNELS
                </span>{"  "}

                    ({channels.length}) <Icon name="add"
                            onClick={this.openModal} />
                    </Menu.Item>

                    {this.displayChannels(channels)}
                </Menu.Menu>

                {/*Add channel Model*/}
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Add a Channel</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="Name of Channel"
                                    name="channelName"
                                    onChange={this.handleChange}
                                    style={{ marginBottom: '1rem' }}
                                />
                                <Input
                                    fluid
                                    label="About the Channel"
                                    name="channelDetails"
                                    onChange={this.handleChange}
                                    style={{ marginBottom: '1rem' }}
                                />
                            </Form.Field>
                        </Form>
                        <Modal.Actions>
                            <Button color="green" inverted onClick={this.handleSubmit}>
                                <Icon name="checkmark" /> Add
                        </Button>

                            <Button color="red" inverted onClick={this.closeModal}>
                                <Icon name="remove" /> Cancel
                        </Button>
                        </Modal.Actions>
                    </Modal.Content>
                </Modal>
            </React.Fragment>
        )
    }
}


const mapDispatchToProps = { setCurrentChannel, setPrivateChannel }


export default connect(null, mapDispatchToProps)(Channels)
