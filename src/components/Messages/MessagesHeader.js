import React, { Component } from 'react'
import { Segment, Header, Icon, Input } from 'semantic-ui-react'

class MessagesHeader extends Component {
    render() {
        const { channelName, numUniqueUsers, handleSearchChange, searchLoading,isPrivateChannel } = this.props
        return (
            <Segment clearing>
                {/*Channel title */}
                <Header fluid="true" as="h2" floated="left"
                    style={{ marginBottom: 0 }}>
                    <span>
                        {channelName}
                        {!isPrivateChannel && <Icon name={"star outline"} color="black" />}
                    </span>
                    <Header.Subheader> {numUniqueUsers}</Header.Subheader>
                </Header>

                {/*Channel search input */}

                <Header floated="right">
                    <Input
                        loading={searchLoading}
                        onChange={handleSearchChange}
                        size="mini"
                        icon="search"
                        name="searchTerm"
                        placeholder="Search messages" />
                </Header>
            </Segment>
        )
    }
}

export default MessagesHeader
