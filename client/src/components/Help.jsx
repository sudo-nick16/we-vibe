import React from 'react'

const Help = ({showHelp, setShowHelp}) => {
    return (
        <div className={`h-screen w-screen z-10 absolute top-0 left-0 bg-cdark-2 opacity-75 flex flex-row justify-center items-center ${showHelp? "" : "hidden"}`}>
            <div className=' w-5/6 h-3/6 lg:w-3/6 md:h-3/6 brounded-lg bg-transparent px-5 relative'>
                <svg onClick={() => setShowHelp(false)} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute top-8 right-3 cursor-pointer hover:text-red-400 bg-black border-0 rounded-full text-clight-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <table className='w-full border-collapse'>
                    <tr> 
                        <th colspan="2" className='text-red-400 text-lg py-2 font-bold'>Commands</th>
                    </tr>
                    <tr>
                        <td className='text-blue-400 font-bold border p-2 border-clight-0'>?p / ?play</td>
                        <td className='text-blue-100 border p-2 border-clight-0'>Play a song or a playlist. Syntax: ?p &lt;song name / song url / playlist url&gt; <br /> Example: ?p never gonna give you up </td>
                    </tr>
                    <tr>
                        <td className='text-blue-400 font-bold border p-2 border-clight-0'>?v / ?pause</td>
                        <td className='text-blue-100 border p-2 border-clight-0'>Pause the song. Syntax: ?v</td>
                    </tr>
                    <tr>
                        <td className='text-blue-400 font-bold border p-2 border-clight-0'>?r / ?resume</td>
                        <td className='text-blue-100 border p-2 border-clight-0'>Resume the song. Syntax: ?v</td>
                    </tr>
                    <tr>
                        <td className='text-blue-400 font-bold border p-2 border-clight-0'>?s / ?skip</td>
                        <td className='text-blue-100 border p-2 border-clight-0'>Skip the song. Syntax: ?s</td>
                    </tr>
                    <tr>
                        <td className='text-blue-400 font-bold border p-2 border-clight-0'>?reset / ?rip</td>
                        <td className='text-blue-100 border p-2 border-clight-0'>Reset the player. Syntax: ?reset</td>
                    </tr>
                </table>
            </div>
        </div>
    )
}

export default Help
