import React, { Component } from 'react'
import { Segment, Input, Button } from 'semantic-ui-react'
import firebase from '../../firebase'
import FileModal from './FileModal'

class MessageForm extends Component {

    constructor(props) {
        super(props)

        this.state = {
            message: '',
            loading: false,
            channel: this.props.currentChannel,
            user: this.props.currentUser,
            errors: [],
            modal:false
        }
    }

    openModal=()=>{
        this.setState({modal:true})
    }

    closeModal=()=>{
        this.setState({modal:false})
    }
    handleChange = event => {
        this.setState(
            {
                [event.target.name]: event.target.value
            }
        )
    }

    createMessage = () => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            content: this.state.message,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            }
        }
        return message
    }

    sendMessage = () => {
        const { messagesRef } = this.props
        const { message, channel } = this.state


        if (message) {
            this.setState({ loading: true })
            messagesRef.child(channel.id)
            .push()
                .set(this.createMessage())
                .then(() => {
                    // console.log('message')
                    this.setState({
                        loading: false,
                        message: '',
                        errors: []
                    })
                })
                .catch(err => {
                    console.log('Message Form', err)
                    this.setState({
                        loading: false,
                        errors: this.state.errors.concat(err)
                    })
                })
        } else {
            this.setState({
                errors: this.state.errors.concat({ message: 'Add a message' })
            })
        }
    }

    render() {
        const { errors,message,loading,modal } = this.state

        return (
            <Segment className="message__form">
                <Input
                    fluid
                    name="message"
                    value={message}
                    style={{ marginBottom: '0.7em' }}
                    label={<Button icon={'add'} />}
                    labelPosition="left"
                    placeholder="Write you message"
                    onChange={this.handleChange}
                    className={errors.some(error=>error.message.includes('message'))? 'error':''}
                />

                <Button.Group icon widths="2">
                    <Button
                        onClick={this.sendMessage}
                        color="orange"
                        content="Add Reply"
                        labelPosition="left"
                        icon="edit"
                        disabled={loading} />
                    <Button
                        color="teal"
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload" 
                        onClick={this.openModal}/>

                    <FileModal
                    modal={modal}
                    closeModal={this.closeModal}/>
                </Button.Group>

            </Segment>
        )
    }
}

export default MessageForm
