import React, { Component } from 'react'
import { Segment, Input, Button } from 'semantic-ui-react'
import firebase from '../../firebase'
import FileModal from './FileModal'
import uuidv4 from 'uuid/v4'
import ProgressBar from './ProgressBar'
import moment from 'moment'

class MessageForm extends Component {

    constructor(props) {
        super(props)

        this.state = {
            storageRef: firebase.storage().ref(),
            uploadTask: null,
            uploadState: '',
            percentUploaded: 0,
            message: '',
            loading: false,
            channel: this.props.currentChannel,
            user: this.props.currentUser,
            errors: [],
            modal: false
        }
    }

    openModal = () => {
        this.setState({ modal: true })
    }

    closeModal = () => {
        this.setState({ modal: false })
    }
    handleChange = event => {
        this.setState(
            {
                [event.target.name]: event.target.value
            }
        )
    }

    getPath=()=>{
        if(this.props.isPrivateChannel){
            return `chat/private-${this.state.channel.id}`
        }else{
            return 'chat/public'
        }
    }

    uploadFile = (file, metadata) => {
        // console.log(file,metadata)
        const pathToUpload = this.state.channel.id
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`

        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath)
                .put(file, metadata)
        }, () => {
            this.state.uploadTask.on('state_changed', snap => {
                console.log(snap+'-----'+new Date().getTime())
                const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
                this.props.isProgressBarVisible(percentUploaded)
                this.setState({ percentUploaded })

            },
                err => {
                    console.log(err)
                    this.setState({
                        errors: this.state.errors.concat(err),
                        uploadTask: null,
                        uploadState: 'error'
                    })
                },
                () => {
                    this.state.uploadTask.snapshot.ref.getDownloadURL()
                        .then(
                            downloadUrl => {
                                this.sendFileMessage(downloadUrl, ref, pathToUpload);
                                this.props.isProgressBarVisible(false)
                            })
                        .catch(err => {
                            console.log(err)
                            this.setState({
                                errors: this.state.errors.concat(err),
                                uploadTask: null,
                                uploadState: 'error'
                            })
                        })
                })

        })
    }

    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({ uploadState: 'done' })
            })
            .catch(error => {
                console.error(error)
                this.setState({
                    errors: this.state.errors.concat(error)
                })
            })
    }

    createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            }
        }
        if (fileUrl !== null) {
            message['image'] = fileUrl
        } else {
            message['content'] = this.state.message
        }
        return message
    }

    sendMessage = () => {
        const { getMessagesRef } = this.props
        const { message, channel } = this.state


        if (message) {
            this.setState({ loading: true })
            getMessagesRef().child(channel.id)
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
        const { errors, message, loading, modal,uploadState, percentUploaded } 
        = this.state

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
                    className={errors.some(error => error.message.includes('message')) ? 'error' : ''}
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
                        disabled={uploadState==='uploading'}
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                        onClick={this.openModal} />
                </Button.Group>
                <FileModal
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile} />
                
                <ProgressBar 
                uploadState={uploadState}
                percentUploaded={percentUploaded}/>

            </Segment>
        )
    }
}

export default MessageForm
