import React, { Component } from 'react'
import { Segment, Input, Button, IconGroup, Form, TextArea, Icon } from 'semantic-ui-react'
import firebase from '../../firebase'
import FileModal from './FileModal'
import uuidv4 from 'uuid/v4'
import ProgressBar from './ProgressBar'
import moment from 'moment'
import { Picker, emojiIndex } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css';

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
            modal: false,
            typingRef: firebase.database().ref('typing'),
            emojiPicker: false
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

    handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            this.sendMessage()
        }

        const { message, typingRef, channel, user } = this.state
        if (message) {
            typingRef
                .child(channel.id)
                .child(user.uid)
                .set(user.displayName)
        } else {
            typingRef
                .child(channel.id)
                .child(user.uid)
                .remove()
        }
    }

    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat/private-${this.state.channel.id}`
        } else {
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
                console.log(snap + '-----' + new Date().getTime())
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

    handleTogglePicker = () => {
        // console.log('toggelPicker')
        this.setState({ emojiPicker: !this.state.emojiPicker })
    }

    // openTogglePicker=()=>{
    //     this.setState({emojiPicker: true})
    // }

    // closeTogglePicker=()=>{
    //     this.setState({emojiPicker: false})
    // }

    sendMessage = () => {
        const { getMessagesRef } = this.props
        const { message, channel, typingRef, user } = this.state
        console.log('message')

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
                    typingRef
                        .child(channel.id)
                        .child(user.uid)
                        .remove()
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


    handleAddEmoji = emoji => {
        // console.log(emoji)

        // console.log('handle add emoji')
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.native}`)

        // this.setState({ message: newMessage, emojiPicker: false })
        this.setState({ message: newMessage})
        setTimeout(() => this.messageInputRef.focus(), 0)
    }

    colonToUnicode = message => {
        // console.log(emojiIndex)
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x = x.replace(/:/g, "")
            let emoji = emojiIndex.emojis[x]
            if (typeof emoji !== "undefined") {

                let unicode = emoji.native
                // console.log(unicode,'unicode')
                if (typeof unicode !== "undefined") {
                    console.log('test')
                    return unicode;
                }
            }
            x = ":" + x + ":"
            return x
        })
    }


    render() {
        const { errors, message, loading, modal, uploadState, percentUploaded, emojiPicker }
            = this.state

        return (
            <Segment className="message__form">
                {emojiPicker && (
                    <Picker
                        set="apple"
                        onSelect={this.handleAddEmoji}
                        className="emojipicker"
                        title="Pick your emoji"
                        emoji="point_up"
                    />
                )}

                {/* <Input
                //     fluid
                //     name="message"
                //     value={message}
                //     ref={node => { this.messageInputRef = node }}
                //     onKeyDown={this.handleKeyDown}
                //     style={{ marginBottom: '0.7em' }}
                //     label={
                //         <Button
                //             icon={emojiPicker ? 'close' : 'smile'}
                //             content={emojiPicker ? "Close" : null}
                //             onClick={this.handleTogglePicker} />}
                //     labelPosition="left"
                //     placeholder="Write you message"
                //     onChange={this.handleChange}
                //     className={errors.some(error => { console.log(errors); error.message.includes('message') }) ? 'error' : ''}
                // />
                // <Button
                //             icon={emojiPicker ? 'close' : 'smile'}
                //             content={emojiPicker ? "Close" : null}
                //             onClick={this.handleTogglePicker} />*/}

                <TextArea
                    fluid
                    name="message"
                    value={message}
                    ref={node => { this.messageInputRef = node }}
                    onKeyDown={this.handleKeyDown}
                    style={{ marginBottom: '0.7em', minHeight: 100, border: '1px solid rgba(34,36,38,.15)' }}
                    row={5}
                    placeholder="Write you message"
                    onChange={this.handleChange}
                    className={errors.some(error => { console.log(errors); error.message.includes('message') }) ? 'error' : ''}
                />

              
                <Button.Group icon widths="7">
                    <Button icon color="orange">
                        <Icon name={emojiPicker ? 'close' : 'smile'}
                            // content={emojiPicker ? "Close" : null}
                            // onClick={emojiPicker? this.closeTogglePicker : this.openTogglePicker} />
                            onClick={this.handleTogglePicker} />
                    </Button>
                    <Button.Group icon widths="2">
                        <Button
                            onClick={this.sendMessage}
                            color="blue"
                            content="Send"
                            labelPosition="left"
                            icon="edit"
                            disabled={loading} />
                        <Button
                            color="teal"
                            disabled={uploadState === 'uploading'}
                            content="Upload Media"
                            labelPosition="right"
                            icon="cloud upload"
                            onClick={this.openModal} />
                    </Button.Group>
                </Button.Group>
                <FileModal
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile} />

                <ProgressBar
                    uploadState={uploadState}
                    percentUploaded={percentUploaded} />

            </Segment>
        )
    }
}

export default MessageForm
