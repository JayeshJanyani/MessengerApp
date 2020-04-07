import React, { Component } from 'react'
import { Modal, ModalContent, Icon, Button, Input } from 'semantic-ui-react'

export class FileModal extends Component {
    render() {
        const{modal,closeModal}=this.props
        return (
           <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header> Select an Image file</Modal.Header>
                <Modal.Content>
                    <Input fluid label="File" name="file" type="file"/>

                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted> <Icon name="checkmark"/> Send</Button>

                    <Button color="red" inverted onClick={closeModal}> <Icon name="remove"/> Cancel</Button>
                </Modal.Actions>
            
            </Modal>
        )
    }
}

export default FileModal
