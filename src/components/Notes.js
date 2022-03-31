import React, { useContext, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import noteContext from '../contex/notes/noteContext'
import AddNote from './AddNote'
import Noteitem from './Noteitem'


const Notes = (props) => {
    const context = useContext(noteContext)
    const { notes, fetchNote, editNote } = context;
    const navigate=useNavigate();
    const [note, setnote] = useState({ id: "", etitle: "", edescription: "", etag: "" })

    const ref = useRef(null);
    const refClose=useRef(null);

    useEffect(() => {
        if(localStorage.getItem('token')){
            fetchNote();
        }
        else
        {
            navigate('/login')
        }
         // eslint-disable-next-line
    }, [])

    const updateNote = (currentNote) => {
        ref.current.click();
        setnote({ id: currentNote._id,etitle: currentNote.title, edescription: currentNote.description, etag: currentNote.tag })
    }
    const handleClick = (e) => {
        e.preventDefault();
        editNote(note.id,note.etitle,note.edescription,note.etag)
        refClose.current.click();
        props.showAlert("Updated Successfully", "success")

    }
    const onChange = (e) => {
        setnote({ ...note, [e.target.name]: e.target.value })
    }
    return (
        <div className='container'>
            <AddNote showAlert={props.showAlert}/>
            <button ref={ref} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Launch demo modal
            </button>
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Edit Note</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="etitle" className="form-label">Title</label>
                                    <input type="text" className="form-control" id="etitle" name="etitle" minLength={5} required value={note.etitle} onChange={onChange} aria-describedby="emailHelp" />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="edescription" className="form-label">Description</label>
                                    <input type="text" className="form-control" id="edescription" name="edescription" minLength={5} required value={note.edescription} onChange={onChange} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="etag" className="form-label">Tag</label>
                                    <input type="text" className="form-control" id="etag" name="etag" minLength={5} required value={note.etag} onChange={onChange} />
                                </div>
                                <button type="submit" className="btn btn-primary" onClick={handleClick}>Add Note</button>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button ref={refClose} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button disabled={note.etitle.length<5 || note.edescription.length<5} type="button" className="btn btn-primary" onClick={handleClick}>Update Note</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container my-3">
                <div className="row">
                    <h1>Your Note</h1>
                    <div className="mx-2">
                    {notes.length===0 && "Note notes to show"}
                    </div>
                    {notes.map((note) => {
                        return <Noteitem key={note._id} showAlert={props.showAlert} updateNote={updateNote} note={note} />
                    })}
                </div>
            </div>
        </div>
    )
}

export default Notes