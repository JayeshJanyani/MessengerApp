import React, { Component } from 'react'
import { Grid, Header, Icon, Dropdown, Image } from 'semantic-ui-react'
import firebase from '../../firebase'
import { connect } from 'react-redux'

class UserPanel extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: this.props.currentUser
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
        text: <span> Change Avatar</span>
    }, {
        key: 'signOut',
        text: <span onClick={this.handleSignOut}>Sign Out</span>
    }]


    handleSignOut = () => {
        firebase.auth().signOut()
            .then(() => console.log('signed out'))
    }


    render() {
        const { user } = this.state;
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
