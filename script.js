const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const fileTableBody = document.querySelector('#file-table tbody');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');


window.addEventListener('load', () => {
  setTimeout(() => {
    const storedFiles = JSON.parse(localStorage.getItem('files')) || [];
    storedFiles.forEach(file => addFileToTable(file, false));
  }, 0);
});

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
   
  dropArea.addEventListener('click', () => {
    fileInput.click();
  });


  
 
fileInput.addEventListener('change',async (e) => {
  const files = e.target.files;
  if (files.length) { 
      const fileData = {
        name: files[0].name,
        size: files[0].size,
        type: files[0].type,
        url:await convert(files[0])
      };
      addFileToTable(fileData);
    
  }
});
 
dropArea.addEventListener('drop', async(e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length) { 
      const fileData = {
        name: files[0].name,
        size: files[0].size,
        type: files[0].type,
        url:await convert(files[0])
      };
      addFileToTable(fileData);
    
  }
});

function convert(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    progressContainer.style.display = 'block';
    progressBar.value = 0;

    let simulatedProgress = 0;

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const realProgress = (event.loaded / event.total) * 100;
        
        const slowUpdate = () => {
          if (simulatedProgress < realProgress) {
            simulatedProgress += 1;  
            progressBar.value = simulatedProgress; 
            progressBar.style.setProperty('--progress-width', `${simulatedProgress}%`);
            setTimeout(slowUpdate, 30);  
          } else {
            progressBar.value = realProgress;
          }
        };

        slowUpdate();
      }
    };

    reader.onload = () => { 
      const completeProgress = () => {
        if (simulatedProgress < 100) {  
          setTimeout(completeProgress, 30); 
        } else {
          progressBar.value = 100;
          progressContainer.style.display = 'none';
          resolve(reader.result);  
        }
      };

      completeProgress();
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

let fileCounter = 1;  

function addFileToTable(file, saveToStorage = true) {   

  const row = document.createElement('tr'); 

  const serialCell = document.createElement('td');
  serialCell.textContent = fileCounter++;
  row.appendChild(serialCell);
 
  const nameCell = document.createElement('td');
  nameCell.textContent = file.name;
  row.appendChild(nameCell);
 
  const sizeCell = document.createElement('td');
  sizeCell.textContent = (file.size / 1024).toFixed(2);
  row.appendChild(sizeCell);
 
  const typeCell = document.createElement('td');
  typeCell.textContent = file.type || 'Unknown';
  row.appendChild(typeCell);
 
  const linkCell = document.createElement('td');
  const link = document.createElement('a'); 
  const tmp=base64ToBlob(file.url,file.type);; 
  link.href = URL.createObjectURL(tmp);  
  link.target = '_blank';
  link.textContent = 'Open';
  linkCell.appendChild(link);
  row.appendChild(linkCell);
 
  const deleteCell = document.createElement('td');
  const deleteButton = document.createElement('span');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'delete-button';
  deleteButton.addEventListener('click', () => deleteFile(file.name, row));
  deleteCell.appendChild(deleteButton);
  row.appendChild(deleteCell);
 
  fileTableBody.appendChild(row);
 
  if (saveToStorage) {
    const storedFiles = JSON.parse(localStorage.getItem('files')) || [];
    storedFiles.push(file);
    localStorage.setItem('files', JSON.stringify(storedFiles));
  }
}
 
function deleteFile(fileName, row) {
  row.remove(); 
  fileCounter--;  
  const storedFiles = JSON.parse(localStorage.getItem('files')) || [];
  const updatedFiles = storedFiles.filter(file => file.name !== fileName);
  localStorage.setItem('files', JSON.stringify(updatedFiles));
 
  Array.from(fileTableBody.children).forEach((row, index) => {
    row.children[0].textContent = index + 1;
  });
}

function base64ToBlob(base64, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(base64.split(',')[1]); 
  let byteArrays=[];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

 
