#include <stdio.h>

#include <stdint.h>

#include <math.h> // -lm

#include "unistd.h"

#include "string.h"

#include <stdlib.h>

#include "MPU6050.h"

#include "gps_imu.h"

#include "MQTTClient.h"

#include "mqtt_pub_sub.h"

#include <unistd.h>

#include <time.h>

#include <wiringPi.h>

#include <wiringPiI2C.h>

#include <linux/i2c-dev.h>

#include <sys/ioctl.h>

#include <fcntl.h>

#ifndef ADS1115_RPI

#define ADS1115_RPI

/*=========================================================================

CONFIG REGISTER

-----------------------------------------------------------------------*/

#define CONFIG_REG_OS_SINGLE (0x8000)

#define CONFIG_REG_OS_BUSY (0x0000)

#define CONFIG_REG_OS_NOTBUSY (0x8000)

#define CONFIG_REG_MUX_MASK (0x7000)

#define CONFIG_REG_MUX_DIFF_0_1 (0x0000) // default

#define CONFIG_REG_MUX_DIFF_0_3 (0x1000)

#define CONFIG_REG_MUX_DIFF_1_3 (0x2000)

#define CONFIG_REG_MUX_DIFF_2_3 (0x3000)

#define CONFIG_REG_MUX_CHAN_0 (0x4000)

#define CONFIG_REG_MUX_CHAN_1 (0x5000)

#define CONFIG_REG_MUX_CHAN_2 (0x6000)

#define CONFIG_REG_MUX_CHAN_3 (0x7000)

#define CONFIG_REG_PGA_6_144V (0x0000) // +/-6.144V range

#define CONFIG_REG_PGA_4_096V (0x0200) // +/-4.096V range

#define CONFIG_REG_PGA_2_048V (0x0400) // +/-2.048V range // default

#define CONFIG_REG_PGA_1_024V (0x0600) // +/-1.024V range

#define CONFIG_REG_PGA_0_512V (0x0800) // +/-0.512V range

#define CONFIG_REG_PGA_0_256V (0x0A00) // +/-0.256V range

#define CONFIG_REG_MODE_CONTIN (0x0000)

#define CONFIG_REG_MODE_SINGLE (0x0100) // default

#define CONFIG_REG_DR_8SPS (0x0000)

#define CONFIG_REG_DR_16SPS (0x0020)

#define CONFIG_REG_DR_32SPS (0x0040)

#define CONFIG_REG_DR_64SPS (0x0060)

#define CONFIG_REG_DR_128SPS (0x0080) // default

#define CONFIG_REG_DR_250SPS (0x00A0)

#define CONFIG_REG_DR_475SPS (0x00C0)

#define CONFIG_REG_DR_860SPS (0x00E0)

#define CONFIG_REG_CMODE_TRAD (0x0000) // default

#define CONFIG_REG_CMODE_WINDOW (0x0010)

#define CONFIG_REG_CPOL_ACTIV_LOW (0x0000) // default

#define CONFIG_REG_CPOL_ACTIV_HIGH (0x0080)

#define CONFIG_REG_CLATCH_NONLATCH (0x0000) // default

#define CONFIG_REG_CLATCH_LATCH (0x0040)

#define CONFIG_REG_CQUE_1CONV (0x0000)

#define CONFIG_REG_CQUE_2CONV (0x0001)

#define CONFIG_REG_CQUE_4CONV (0x0002)

#define CONFIG_REG_CQUE_NONE (0x0003) // default

#endif

int i2cFile;

// int deviceAddr = 0x48;

int openI2CBus(char *bus);

int setI2CSlave(unsigned char deviceAddr);

float readVoltage(int channel);

unsigned char writeBuf[3] = {0};

time_t var1 = 0, var2 = 0;

float time_diff;

float Ax, Ay, Az;

float Vx = 0, Vy = 0, Vz = 0, V = 0;

float delT1 = 0.5;

float lat, lon, result, adc;

float f_nhiptim;

time_t start_time;

int count = 0;

float average;

float sum = 0;

float optimize;

int temp;

int dem = 0;

float heartRate = 0.0, adc1;

template <int order> // order is 1 or 2

class LowPass

{

private:
    float a[order];

    float b[order + 1];

    float omega0;

    float dt;

    bool adapt;

    float tn1 = 0;

    float x[order + 1]; // Raw values

    float y[order + 1]; // Filtered values

public:
    LowPass(float f0, float fs, bool adaptive)
    {

        // f0: cutoff frequency (Hz)

        // fs: sample frequency (Hz)

        // adaptive: boolean flag, if set to 1, the code will automatically set

        // the sample frequency based on the time history.

        omega0 = 6.28318530718 * f0; // Tính toán omega0 từ tần số cắt f0

        dt = 1.0 / fs; // Khoảng thời gian giữa các mẫu

        adapt = adaptive; // Cờ cho biết liệu có tự động điều chỉnh tần số lấy mẫu hay không

        tn1 = -dt; // Thời điểm gần nhất của mẫu trước đó, khởi tạo ban đầu là -dt (để tính dt ban đầu)

        for (int k = 0; k < order + 1; k++)
        {

            x[k] = 0; // Khởi tạo mảng x với giá trị 0

            y[k] = 0; // Khởi tạo mảng y với giá trị 0
        }

        setCoef(); // Thiết lập hệ số bộ lọc
    }

    void setCoef()
    {

        if (adapt)
        {

            float t = micros() / 1.0e6; // Lấy thời điểm hiện tại tính bằng micro giây

            dt = t - tn1; // Tính dt dựa trên khoảng thời gian giữa các mẫu

            tn1 = t; // Cập nhật thời điểm trước đó
        }

        float alpha = omega0 * dt; // Tính alpha từ omega0 và dt

        if (order == 1)
        {

            a[0] = -(alpha - 2.0) / (alpha + 2.0); // Thiết lập hệ số a cho bộ lọc bậc nhất

            b[0] = alpha / (alpha + 2.0); // Thiết lập hệ số b cho bộ lọc bậc nhất

            b[1] = alpha / (alpha + 2.0); // Thiết lập hệ số b cho bộ lọc bậc nhất
        }

        if (order == 2)
        {

            float alphaSq = alpha * alpha; // Tính alpha bình phương

            float beta[] = {1, sqrt(2), 1}; // Mảng các hệ số beta

            float D = alphaSq * beta[0] + 2 * alpha * beta[1] + 4 * beta[2]; // Tính D

            b[0] = alphaSq / D; // Thiết lập hệ số b cho bộ lọc bậc hai

            b[1] = 2 * b[0]; // Thiết lập hệ số b cho bộ lọc bậc hai

            b[2] = b[0]; // Thiết lập hệ số b cho bộ lọc bậc hai

            a[0] = -(2 * alphaSq * beta[0] - 8 * beta[2]) / D; // Thiết lập hệ số a cho bộ lọc bậc hai

            a[1] = -(beta[0] * alphaSq - 2 * beta[1] * alpha + 4 * beta[2]) / D; // Thiết lập hệ số a cho bộ lọc bậc hai
        }
    }

    float filt(float xn)
    {

        // Provide me with the current raw value: x

        // I will give you the current filtered value: y

        if (adapt)
        {

            setCoef(); // Cập nhật hệ số nếu cần thiết
        }

        y[0] = 0; // Khởi tạo giá trị lọc hiện tại y

        x[0] = xn; // Lưu giá trị vào mảng x

        // Tính toán giá trị lọc

        for (int k = 0; k < order; k++)
        {

            y[0] += a[k] * y[k + 1] + b[k] * x[k];
        }

        y[0] += b[order] * x[order];

        // Lưu giá trị vào lịch sử

        for (int k = order; k > 0; k--)
        {

            y[k] = y[k - 1];

            x[k] = x[k - 1];
        }

        // Trả về giá trị lọc

        return y[0];
    }
};

// Filter instance

LowPass<1> lp(4, 1e3, true);

int on_message(void *context, char *topicName, int topicLen, MQTTClient_message *message)
{

    char *payload = (char *)message->payload;

    printf("Received message: %s\n", payload);

    MQTTClient_freeMessage(&message);

    MQTTClient_free(topicName);

    return 1;
}

// Xử lý giá trị đọc từ cảm biến AD8232 thành giá trị nhịp tim

float processHeartRateValue()
{

    if (dem == 0)
    {

        start_time = time(NULL);
    }

    if (adc > 1.6)
    {

        dem++;
    }

    if (difftime(time(NULL), start_time) == 6)
    {

        heartRate = dem * 10;

        dem = 0;
    }

    return heartRate;
}

float locdulieu(float resultt)

{

    static int calculated = 0; // Biến đánh dấu xem giá trị trung bình đã được tính hay chưa

    if (count == 0)
    {

        start_time = time(NULL);
    }

    sum += resultt;

    count++;

    if (difftime(time(NULL), start_time) >= 3 && !calculated)
    {

        average = (double)sum / count;

        printf("Giá trị trung bình trong 3 giây đầu là: %0.5f\n", average);

        calculated = 1; // Đánh dấu rằng giá trị trung bình đã được tính
    }

    resultt = resultt - average;

    optimize = resultt;

    return optimize;
}

int openI2CBus(char *bus)

{

    if ((i2cFile = open(bus, O_RDWR)) < 0)

    {

        printf("Failed to open the bus. \n");

        return -1;
    }
    else
    {

        printf("Bus open \n");

        return 1;
    }
}

int setI2CSlave(unsigned char deviceAddr)

{

    if (ioctl(i2cFile, I2C_SLAVE, deviceAddr) < 0)

    {

        printf("Failed to set I2C_SLAVE at address: 0x%x. \n", deviceAddr);

        return -1;
    }
    else
    {

        printf("I2C_SLAVE set at address: 0x%x \n", deviceAddr);

        return 1;
    }
}

void configDevice(unsigned int config)

{

    writeBuf[0] = 0x01;

    writeBuf[1] = config >> 8;

    writeBuf[2] = config && 0xFF;

    write(i2cFile, writeBuf, 3);

    usleep(25);
}

float readVoltage(int channel)

{

    unsigned char readBuf[2] = {0};

    unsigned int analogVal;

    float voltage;

    unsigned int config = 0;

    config = CONFIG_REG_OS_BUSY |

             CONFIG_REG_PGA_2_048V |

             CONFIG_REG_MODE_CONTIN |

             CONFIG_REG_DR_128SPS |

             CONFIG_REG_CMODE_TRAD |

             CONFIG_REG_CPOL_ACTIV_LOW |

             CONFIG_REG_CLATCH_NONLATCH |

             CONFIG_REG_CQUE_NONE;

    switch (channel)
    {

    case 0:

        config |= CONFIG_REG_MUX_CHAN_0;

        break;

    case 1:

        config |= CONFIG_REG_MUX_CHAN_1;

        break;

    case 2:

        config |= CONFIG_REG_MUX_CHAN_2;

        break;

    case 3:

        config |= CONFIG_REG_MUX_DIFF_0_1;

        break;

    default:

        printf("Give a channel between 0-3\n");
    }

    configDevice(config);

    writeBuf[0] = 0x00;

    write(i2cFile, writeBuf, 1);

    if (read(i2cFile, readBuf, 2) != 2) // read data and check error

    {

        printf("Error : Input/Output Error \n");
    }

    else

    {

        analogVal = readBuf[0] << 8 | readBuf[1];

        voltage = (float)analogVal * 2.048 / 32767.0;
    }

    return voltage;
}

//*******************************************************************************

//                               MAIN CODE

//*******************************************************************************

int main(int argc, char *argv[])

{

    const char *devicePath = "/dev/i2c-1";

    if (openI2CBus(const_cast<char *>(devicePath)) == -1)

    {

        return EXIT_FAILURE;
    }

    setI2CSlave(0x48);

    int fd;

    //***********GPS declare variable************

    char c;

    Ublox M8_Gps;

    float gpsArray[10];

    int time, hour, minute, second;

    MPU6050_init();

    MQTTClient client;

    MQTTClient_create(&client, ADDRESS, CLIENTID, MQTTCLIENT_PERSISTENCE_NONE, NULL);

    MQTTClient_connectOptions conn_opts = MQTTClient_connectOptions_initializer;

    MQTTClient_setCallbacks(client, NULL, NULL, on_message, NULL);

    int rc;

    if ((rc = MQTTClient_connect(client, &conn_opts)) != MQTTCLIENT_SUCCESS)
    {

        printf("Failed to connect, return code %d\n", rc);

        exit(-1);
    }

    // listen for operation

    MQTTClient_subscribe(client, SUB_TOPIC, 0);

    while (1)
    {

        //--------------------------------

        while (serialDataAvail(fd))
        {

            c = serialGetchar(fd);

            if (M8_Gps.encode(c))
            {

                gpsArray[0] = M8_Gps.altitude;

                gpsArray[1] = M8_Gps.latitude;

                gpsArray[2] = M8_Gps.longitude;

                gpsArray[3] = M8_Gps.sats_in_use;

                gpsArray[4] = M8_Gps.datetime.day;

                gpsArray[5] = M8_Gps.datetime.month;

                gpsArray[6] = M8_Gps.datetime.year;

                gpsArray[7] = M8_Gps.datetime.hours + 7;

                gpsArray[8] = M8_Gps.datetime.minutes;

                gpsArray[9] = M8_Gps.datetime.seconds;
            }
        }

        lat = gpsArray[1];

        lon = gpsArray[2];

        hour = gpsArray[7];

        minute = gpsArray[8];

        second = gpsArray[9];

        time = gpsArray[7] * 3600 + gpsArray[8] * 60 + gpsArray[9];

        // printf("\nlat = %0.5f\n", lat);

        // printf("\nlon = %0.5f\n", lon);

        //--------------------------------

        char msg[100];

        Az = get_Az_value();

        Ay = get_Ay_value();

        Az = get_Az_value();

        int getAx = 0, getAy = 0, getAz = 0;

        if (getAz < 10 && getAy < 10)
        {

            getAz++;

            getAy++;

            Az = get_Az_value();

            Ay = get_Ay_value();

            Az += Az;

            Ay += Ay;
        }

        else
        {

            getAz = 0;

            getAy = 0;

            Az = Az / 10;

            Ay = Ay / 10;
        }

        KalmanFilter(Ax, Az, lat, lon);

        adc = lp.filt(readVoltage(3));

        adc1 = readVoltage(3);

        // processHeartRateValue();

        // printf("raw :%0.3f   filter:%0.3f   dem:%d \n",adc1,adc,dem++);

        //**************************SEND DATA TO BROKER*********************************

        sprintf(msg, "{\"heart_rate\":%0.3f, \"heart_draw\":%0.3f, \"v\":%0.2f, \"lat\":%0.5f, \"lon\":%0.5f}", adc1, adc, V_corr, 0, 0);

        publish(client, PUB_TOPIC, msg);
    }

    MQTTClient_disconnect(client, 1);

    MQTTClient_destroy(&client);

    return rc;
}
