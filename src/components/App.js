import React from 'react';
import './App.css';
import { Grid } from 'semantic-ui-react';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';
import { connect } from 'react-redux'

function App({ currentUser, currentChannel,isPrivateChannel, userPosts }) {
  return (
    <Grid columns="equal" className="app" style={{ background: '#eee' }}>
      {/* <ColorPanel /> */}
      <SidePanel
        key={currentUser && currentUser.id}
        currentUser={currentUser} />
      <Grid.Column style={{ marginLeft: 250 }}>
        <Messages
          key={currentChannel && currentChannel.id}
          currentChannel={currentChannel}
          currentUser={currentUser}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>
      {/* semantic UI uses 16 point grid system */}
      <Grid.Column width={4}>
        <MetaPanel 
        key={currentChannel && currentChannel.id}
        currentChannel={currentChannel}
        isPrivateChannel={isPrivateChannel}
        userPosts={userPosts}
        />
      </Grid.Column>
    </Grid>
  );
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    currentChannel: state.channel.currentChannel,
    isPrivateChannel: state.channel.isPrivateChannel,
    userPosts: state.channel.userPosts
  }
}

export default connect(mapStateToProps, null)(App);
