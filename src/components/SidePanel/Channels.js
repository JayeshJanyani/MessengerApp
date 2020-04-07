import React, { Component } from 'react'
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react'
import firebase from '../../firebase'
import { connect } from 'react-redux'
import {setCurrentChannel} from '../../actions/index'

class Channels extends Component {

    constructor(props) {
        super(props)

        this.state = {
            user: this.props.currentUser,
            channels: [],
            channelName: '',
            channelDetails: '',
            modal: false,
            firstLoad:true,
            activeChannel:'',
            channelRef: firebase.database().ref('channels')


        }
    }

    componentDidMount() {
        this.addListeners()
    }

    componentWillUnmount(){
        this.removeListeners()
    }

    removeListeners=()=>{
        this.state.channelRef.off()
    }

    addListeners = () => {
        let loadedChannels=[]
        this.state.channelRef.on('child_added',snap=>{
            loadedChannels.push(snap.val())
            console.log(loadedChannels)
            this.setState({channels:loadedChannels},
            ()=> this.setFirstChannel())
        })
    }

    setFirstChannel=()=>{
        const firstChannel=this.state.channels[0];
        // console.log(firstChannel)

        if(this.state.firstLoad && this.state.channels.length>0){
            this.props.setCurrentChannel(firstChannel)
            // console.log('channel updated with', firstChannel)
            this.setActiveChannel(firstChannel)
        }
        this.setState({firstLoad:false})
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

    displayChannels=(channels)=> (
        channels.length>0 && channels.map(channel=>(
            <Menu.Item
                key={channel.id}
                onClick={()=>this.changeChannel(channel)}
                name={channel.name}
                style={{opacity: 0.7}}
                active={channel.id ===this.state.activeChannel}
                >
                # {channel.name}
                </Menu.Item>
        ))
    )

    changeChannel=channel=>{
        // this.props.setCurrentChannel(channel)
        this.setActiveChannel(channel)
        this.props.setCurrentChannel(channel)

    }

    setActiveChannel=channel=>{
        this.setState({activeChannel: channel.id})
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


const mapDispatchToProps={setCurrentChannel}


export default connect(null,mapDispatchToProps) (Channels)
