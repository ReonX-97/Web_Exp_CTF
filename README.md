# CTF Challenge: Hidden Code Generator

This is a Capture The Flag (CTF) challenge that tests participants' ability to discover a hidden API endpoint.

## Challenge Description

Participants are presented with a terminal-like interface where they need to enter an access code. 
The correct code will reveal a flag. The twist is that valid codes can only be generated through 
a hidden DELETE endpoint that participants need to discover.

## Flag

The flag is: `CTF{h1dd3n_d3l3t3_3ndp01nt_f0und}`

## Deployment

This application is deployed on Render.com using:
- Node.js web service
- PostgreSQL database
- Environment variables for configuration

## Solution Hint

Look at the network requests and consider what HTTP methods might be available beyond the obvious ones.# Web_Exp_CTF
