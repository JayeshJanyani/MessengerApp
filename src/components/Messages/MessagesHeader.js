import React, { Component } from 'react'
import { Segment, Header, Icon, Input } from 'semantic-ui-react'

 class MessagesHeader extends Component {
    render() {
        return (
            <Segment clearing>
             {/*Channel title */}
                <Header fluid="true" as="h2" floated="left"
                style={{marginBottom: 0}}>
                <span>
                Channel
                <Icon name={"star outline"} color="black"/>
                </span>
                <Header.Subheader> 2 Users</Header.Subheader>
                </Header>

                {/*Channel search input */}

                <Header floated="right">
                    <Input
                    size="mini"
                    icon="search"
                    name="searchTerm"
                    placeholder="Search messages"/>
                </Header>
            </Segment>
        )
    }
}

export default MessagesHeader
