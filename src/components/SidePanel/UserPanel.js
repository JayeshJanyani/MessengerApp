import React, { Component } from 'react'
import { Grid, Header, Icon, Dropdown } from 'semantic-ui-react'

class UserPanel extends Component {

    dropdownOptions = () => [{
        key: 'user',
        text: <span> Signed in as <strong>User</strong></span>,
        disabled: true
    },
    {
        key: 'avatar',
        text: <span> Change Avatar</span>
    }, {
        key: 'signOut',
        text: <span>Sign Out</span>
    }]

    render() {
        return (
            <Grid style={{ background: '#4c3c4c' }}>
                <Grid.Column>
                    <Grid.Row width={4} style={{ padding: '1.2rem', margin: 0 }}>
                        {/* AppHeader */}
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>Dev Chat</Header.Content>
                        </Header>
                    </Grid.Row>

                    {/* User dropdown*/}
                    <Header style={{ padding: '0.25em' }} as="h4" inverted>
                        <Dropdown trigger={
                            <span> User</span>
                        } options={
                            this.dropdownOptions()
                        } />
                    </Header>
                </Grid.Column>
            </Grid>
        )
    }
}

export default UserPanel
