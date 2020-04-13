import React, { Component } from 'react'
import { Grid, Header, Icon, Dropdown, Image, Modal, Button, Input } from 'semantic-ui-react'
import firebase from '../../firebase'
import { connect } from 'react-redux'
import AvatarEditor from 'react-avatar-editor'


class UserPanel extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: this.props.currentUser,
            modal:false,
            previewImage:'',
            croppedImage:'',
            blob:'',
            uploadCroppedImage:'',
            storageRef: firebase.storage().ref(),
            userRef: firebase.auth().currentUser,
            usersRef: firebase.database().ref('users'),
            metadata:{
                contentType:'image/jpeg'
            }
        }
    }


    // componentDidMount() {
    //     this.setState({ user: this.props.currentUser })
    // }

    // componentWillReceiveProps(nextProps){
    //     this.setState({user: nextProps.currentUser})
    // }


    dropdownOptions = () => [{
        key: 'user',
        text: <span> Signed in as <strong>{this.state.user.displayName}</strong></span>,
        disabled: true
    },
    {
        key: 'avatar',
        text: <span onClick={this.openModal}> Change Avatar</span>
    }, {
        key: 'signOut',
        text: <span onClick={this.handleSignOut}>Sign Out</span>
    }]

    openModal=()=>this.setState({modal:true})
    
    closeModal=()=>this.setState({modal:false})

    handleSignOut = () => {
        firebase.auth().signOut()
            .then(() => console.log('signed out'))
    }
    handleChange=event=>{
        const file=event.target.files[0]
        const reader=new FileReader()

        if(file){
            reader.readAsDataURL(file)
            reader.addEventListener('load',()=>{
                this.setState({previewImage: reader.result})
            })
        }
    }

    uploadCroppedImage=()=>{
        const {storageRef,userRef,blob, metadata}=this.state
        storageRef.child(`avatars/user/${userRef.uid}`)
        .put(blob, metadata)
        .then(snap=>{
            snap.ref.getDownloadURL().then(downloadURL=>{
                this.setState({uploadCroppedImage: downloadURL},()=>{
                    this.changeAvatar()
                })
            })
        })
    }

    changeAvatar=()=>{
        this.state.userRef.updateProfile({
            photoURL: this.state.uploadCroppedImage
        })
        .then(()=>{
            console.log('photoURL updated')
            this.closeModal()
        })
        .catch(error=>{
            console.log(error)
        })

        this.state.usersRef
        .child(this.state.user.uid)
        .update({avatar: this.state.uploadCroppedImage})
        .then(()=>{
            console.log('user avatar updated')
        }).catch(errors=>{
            console.log(errors)
        })
    }


    handleCropImage=()=>{
        if(this.avatarEditor){
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob=>{
                let imageUrl=URL.createObjectURL(blob);
                this.setState({
                    croppedImage: imageUrl,
                    blob
                })
            })
        }
    }

    render() {
        const { user, modal, previewImage, croppedImage} = this.state;
        // console.log("user details: ",this.props.currentUser.displayName)
        return (
            <Grid style={{ background: '#18bcb1', width: '18rem', fontColor:'' }}>
                <Grid.Column>
                    <Grid.Row width={4} style={{ padding: '1.2rem', margin: 0 }}>
                        {/* AppHeader */}
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>HELLOSKILLS</Header.Content>
                        </Header>

                        {/* User dropdown*/}
                        <Header style={{ padding: '0.25em' }} as="h4" inverted>
                            <Dropdown trigger={
                                <span>
                                    <Image src={user.photoURL} spaced="right" avatar />
                                    {user.displayName}
                                </span>
                            } options={
                                this.dropdownOptions()
                            } />
                        </Header>
                    </Grid.Row>

                        {/*Change User Avatar Modal */}
                        <Modal basic open={modal} onClose={this.closeModal}>
                            <Modal.Header>Change Avatar
                            </Modal.Header>
                            <Modal.Content>
                                <Input onChange={this.handleChange} fluid type="file" label="New Avatar" name="previewImage"></Input>

                                <Grid centered stackable columns={2}>
                                    <Grid.Row centered> 
                                        <Grid.Column className="ui center aligned grid">
                                         {/*Image preview */}
                                         {previewImage &&  (
                                             <AvatarEditor
                                             ref={node=> {this.avatarEditor=node}}
                                             image={previewImage}
                                             width={120}
                                             height={120}
                                             border={50}
                                             scale={1.2}/>
                                         )}
                                        </Grid.Column>
                                        <Grid.Column>
                                            {/*Cropped Image */}
                                            {croppedImage && <Image style={{margin: '3.5em auto'}}
                                            width={100}
                                            height={100}
                                            src={croppedImage}/>}
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Modal.Content>
                            <Modal.Actions>
                                {croppedImage && <Button color="green" inverted onClick={this.uploadCroppedImage}>
                                    <Icon name="save"/> Change Avatar
                                </Button>}
                                <Button color="green" inverted onClick={this.handleCropImage}>
                                    <Icon name="image"/> Preview
                                </Button>
                                <Button color="red" inverted onClick={this.closeModal}>
                                    <Icon name="remove"/> Cancel
                                </Button>
                            </Modal.Actions>
                        </Modal>

                </Grid.Column>
            </Grid>
        )
    }
}
// const mapStateToProps = state => {
//     return {
//         currentUser: state.user.currentUser
//     }
// }

export default UserPanel
