import './InputField.css'


export default function InputField(){
    return(
        <>
             <div className="hn-input">
            <input type="text" placeholder="First Name"  className='hn-field1'/>
            <input type="text" placeholder="Last Name"  className='hn-field2' />
            <input type="email" placeholder="Email"  className='hn-field3' />
            <input type="number" placeholder="Password"   className='hn-field4'/>
            <input type="text" placeholder="Specialization"  list="fields" className='hn-field5' />
            
            <datalist id="fields">
                <option value="AI">AI</option>
                <option value="Software">Software</option>
                <option value="Networking">Networking</option>
            </datalist>
        </div>
        </>
    )
}