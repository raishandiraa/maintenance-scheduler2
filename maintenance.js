const mesinLists = {
    T1: JSON.parse(localStorage.getItem('T1')) || [],
    T2: JSON.parse(localStorage.getItem('T2')) || [],
    T3: JSON.parse(localStorage.getItem('T3')) || [],
    T5: JSON.parse(localStorage.getItem('T5')) || [],
    M1: JSON.parse(localStorage.getItem('M1')) || [],
    T6: JSON.parse(localStorage.getItem('T6')) || [],
    C1: JSON.parse(localStorage.getItem('C1')) || [],
    C2: JSON.parse(localStorage.getItem('C2')) || []
};

let currentMode = 'user';
let loopInterval;
let currentTab = 'T1';

function tambahHari(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDate(date) {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

function getStatus(tanggalPerbaikanBerikutnya) {
    const now = new Date();
    const diffTime = tanggalPerbaikanBerikutnya - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
        return { text: `Masih ${diffDays} hari lagi`, className: 'status-green' };
    } else if (diffDays >= 0) {
        return { text: `${diffDays} hari lagi`, className: 'status-yellow' };
    } else {
        return { text: `Telat ${Math.abs(diffDays)} hari`, className: 'status-red' };
    }
}

function tampilkanJadwal(line) {
    const mesinList = mesinLists[line];
    const outputId = `output${line}`;

    mesinList.sort((a, b) => new Date(a.tanggalPerbaikanBerikutnya) - new Date(b.tanggalPerbaikanBerikutnya));
    let output = "<table><tr><th>No</th><th>Nama Mesin</th><th>Tanggal Perbaikan Terakhir</th><th>Interval (Hari)</th><th>Tanggal Perbaikan Berikutnya</th><th>Status</th>";
    if (currentMode === 'user') {
        output += "<th>DEL</th>";
    }
    output += "</tr>";
    mesinList.forEach((mesin, index) => {
        const status = getStatus(new Date(mesin.tanggalPerbaikanBerikutnya));
        output += `<tr><td>${index + 1}</td><td>${mesin.nama}</td><td>${formatDate(new Date(mesin.tanggalPerbaikanTerakhir))}</td><td>${mesin.intervalHari}</td><td>${formatDate(new Date(mesin.tanggalPerbaikanBerikutnya))}</td><td class="${status.className}">${status.text}</td>`;
        if (currentMode === 'user') {
            output += `<td><img src="delete-icon.png" class="delete-icon" onclick="hapusMesin(${index}, '${line}')" alt="Delete"></td>`;
        }
        output += `</tr>`;
    });
    output += "</table>";
    document.getElementById(outputId).innerHTML = output;
}

function tandaiService(line) {
    const mesinList = mesinLists[line];
    const input = prompt("Masukkan nomor atau nama mesin yang sudah di-service (contoh: 1, 2, A1, B2):");
    const inputs = input.split(',').map(item => item.trim());

    inputs.forEach(item => {
        let index = -1;

        if (!isNaN(item)) {
            index = parseInt(item) - 1;
        } else {
            index = mesinList.findIndex(mesin => mesin.nama.toLowerCase() === item.toLowerCase());
        }

        if (index >= 0 && index < mesinList.length) {
            mesinList[index].tanggalPerbaikanTerakhir = mesinList[index].tanggalPerbaikanBerikutnya;
            mesinList[index].tanggalPerbaikanBerikutnya = tambahHari(mesinList[index].tanggalPerbaikanBerikutnya, mesinList[index].intervalHari);
        } else {
            alert(`Mesin dengan nama atau nomor ${item} tidak ditemukan.`);
        }
    });

    localStorage.setItem(line, JSON.stringify(mesinList));

    alert("Mesin telah ditandai sudah di-service.");
    tampilkanJadwal(line);
}

function tambahMesin(line) {
    const mesinList = mesinLists[line];
    const nama = prompt("Masukkan nama mesin:");
    const mesinExists = mesinList.some(mesin => mesin.nama.toLowerCase() === nama.toLowerCase());

    if (mesinExists) {
        alert("Mesin dengan nama tersebut sudah terdaftar.");
        return;
    }

    const tanggal = prompt("Masukkan tanggal perbaikan terakhir (dd mm yyyy):");
    const [hari, bulan, tahun] = tanggal.split(' ').map(Number);
    const tanggalPerbaikanTerakhir = new Date(tahun, bulan - 1, hari);

    const intervalHari = parseInt(prompt("Masukkan interval perbaikan (hari):"));

    const mesinBaru = {
        nama: nama,
        tanggalPerbaikanTerakhir: tanggalPerbaikanTerakhir,
        intervalHari: intervalHari,
        tanggalPerbaikanBerikutnya: tambahHari(tanggalPerbaikanTerakhir, intervalHari)
    };

    mesinList.push(mesinBaru);

    localStorage.setItem(line, JSON.stringify(mesinList));

    alert("Mesin berhasil ditambahkan.");
    tampilkanJadwal(line);
}

function hapusMesin(index, line) {
    const mesinList = mesinLists[line];
    mesinList.splice(index, 1);

    localStorage.setItem(line, JSON.stringify(mesinList));

    alert("Mesin telah dihapus.");
    tampilkanJadwal(line);
}

function editMesin(line) {
    const mesinList = mesinLists[line];
    const nama = prompt("Masukkan nama mesin yang ingin diedit:");
    const mesinIndex = mesinList.findIndex(mesin => mesin.nama.toLowerCase() === nama.toLowerCase());

    if (mesinIndex === -1) {
        alert("Mesin tidak ditemukan.");
        return;
    }

    const mesin = mesinList[mesinIndex];

    const newTanggal = prompt("Masukkan tanggal perbaikan terakhir baru (dd mm yyyy):", formatDate(new Date(mesin.tanggalPerbaikanTerakhir)));
    if (newTanggal) {
        const [hari, bulan, tahun] = newTanggal.split(' ').map(Number);
        if (!isNaN(hari) && !isNaN(bulan) && !isNaN(tahun)) {
            mesin.tanggalPerbaikanTerakhir = new Date(tahun, bulan - 1, hari);
        }
    }

    const newInterval = prompt("Masukkan interval perbaikan baru (hari):", mesin.intervalHari);
    if (newInterval) {
        const interval = parseInt(newInterval);
        if (!isNaN(interval)) {
            mesin.intervalHari = interval;
        }
    }

    mesin.tanggalPerbaikanBerikutnya = tambahHari(mesin.tanggalPerbaikanTerakhir, mesin.intervalHari);

    localStorage.setItem(line, JSON.stringify(mesinList));

    alert("Data mesin telah diperbarui.");
    tampilkanJadwal(line);
}

function openTab(evt, tabName) {
    if (currentMode === 'loop') return; // Prevent tab change in loop mode

    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    currentTab = tabName;
}

function setMode(mode) {
    currentMode = mode;
    const lineTitle = document.getElementById('lineTitle');
    if (mode === 'loop') {
        lineTitle.style.display = 'block';
        loopInterval = setInterval(loopTabs, 10000); // 10 seconds interval
    } else {
        clearInterval(loopInterval);
        lineTitle.style.display = 'none';
    }
    document.querySelector('.dropdown').style.display = mode === 'user' ? 'inline-block' : 'none';
    document.querySelector('.mode-buttons').style.display = 'flex';
}

function loopTabs() {
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    var tablinks = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    const tabs = ['T1', 'T2', 'T3', 'T5', 'M1', 'T6', 'C1', 'C2'];
    currentTab = tabs[(tabs.indexOf(currentTab) + 1) % tabs.length];
    document.getElementById(currentTab).style.display = "block";
    document.querySelector(`[onclick="openTab(event, '${currentTab}')"]`).className += " active";
    
    const lineTitle = document.getElementById('lineTitle');
    lineTitle.textContent = currentTab;
}

// Menampilkan jadwal saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("T1").style.display = "block"; // Default tab
    document.querySelector(`[onclick="openTab(event, 'T1')"]`).classList.add("active");
    tampilkanJadwal('T1');
    tampilkanJadwal('T2');
    tampilkanJadwal('T3');
    tampilkanJadwal('T5');
    tampilkanJadwal('M1');
    tampilkanJadwal('T6');
    tampilkanJadwal('C1');
    tampilkanJadwal('C2');
    setInterval(() => {
        if (currentMode === 'user') {
            tampilkanJadwal('T1');
            tampilkanJadwal('T2');
            tampilkanJadwal('T3');
            tampilkanJadwal('T5');
            tampilkanJadwal('M1');
            tampilkanJadwal('T6');
            tampilkanJadwal('C1');
            tampilkanJadwal('C2');
        }
    }, 60000); // Memperbarui jadwal setiap 60 detik hanya dalam User Mode
});
