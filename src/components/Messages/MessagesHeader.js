import React, { Component } from 'react'
import { Segment, Header, Icon, Input } from 'semantic-ui-react'

class MessagesHeader extends Component {
    render() {
        const { channelName, numUniqueUsers, handleSearchChange, searchLoading, isPrivateChannel,
            isChannelStarred, handleStar } = this.props
        return (
            <Segment clearing>
                {/*Channel title */}
                <Header fluid="true" as="h2" floated="left"
                    style={{ marginBottom: 0 }}>
                    <span>
                        {channelName}
                        {!isPrivateChannel && (
                            <Icon onClick={handleStar} 
                            className={isChannelStarred ? 'star' : 'star outline'} 
                            color={isChannelStarred ? 'yellow' : 'black'} />
                        )}
                    </span>
                    {!isPrivateChannel && (<Header.Subheader> {numUniqueUsers}</Header.Subheader>)}
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
